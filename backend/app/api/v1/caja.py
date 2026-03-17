"""API de sistemas de caja: movimientos, cortes y análisis por OT."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal

from app.database import get_db
from app.models.user import User
from app.models.movimiento_caja import MovimientoCaja, TipoMovimientoCajaEnum
from app.models.corte_caja import CorteCaja, TipoCorteCajaEnum
from app.models.gasto import Gasto
from app.models.orden_trabajo import OrdenTrabajo
from app.models.apertura_caja import AperturaCaja
from app.schemas.caja import (
    MovimientoCajaCreate,
    CorteCajaCreate,
    AperturaCajaCreate,
)
from app.core.dependencies import get_current_active_user, require_role

router = APIRouter(tags=["caja"])


def _saldo_inicial_para_fecha(db: Session, fecha: date) -> float:
    """Saldo inicial del día: apertura de caja si existe para esa fecha, si no último corte."""
    apertura = db.query(AperturaCaja).filter(AperturaCaja.fecha == fecha).first()
    if apertura:
        return float(apertura.monto)
    ultimo_corte = db.query(CorteCaja).filter(CorteCaja.fecha < fecha).order_by(CorteCaja.fecha.desc()).first()
    return float(ultimo_corte.saldo_final) if ultimo_corte else 0.0


def _mov_to_response(m: MovimientoCaja) -> dict:
    d = {
        "id": m.id,
        "fecha": m.fecha.isoformat() if m.fecha else None,
        "tipo": (m.tipo.value if m.tipo else "").upper(),
        "concepto": m.concepto,
        "monto": float(m.monto) if m.monto is not None else 0,
        "orden_trabajo_id": m.orden_trabajo_id,
        "corte_id": m.corte_id,
        "usuario_id": m.usuario_id,
        "created_at": m.created_at,
        "folio_orden": None,
        "usuario_nombre": None,
    }
    if m.orden_trabajo:
        d["folio_orden"] = getattr(m.orden_trabajo, "folio", None)
    if m.usuario:
        d["usuario_nombre"] = getattr(m.usuario, "nombre_completo", None)
    return d


@router.get("/caja/movimientos", response_model=List[dict])
def list_movimientos(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=500),
    tipo: Optional[str] = Query(None, description="ENTRADA o SALIDA"),
    orden_trabajo_id: Optional[int] = Query(None),
    fecha_desde: Optional[date] = Query(None),
    fecha_hasta: Optional[date] = Query(None),
):
    """Listar movimientos de caja con filtros."""
    q = db.query(MovimientoCaja).options(
        joinedload(MovimientoCaja.orden_trabajo),
        joinedload(MovimientoCaja.usuario),
    )
    if tipo:
        q = q.filter(MovimientoCaja.tipo == tipo.upper())
    if orden_trabajo_id is not None:
        q = q.filter(MovimientoCaja.orden_trabajo_id == orden_trabajo_id)
    if fecha_desde:
        q = q.filter(MovimientoCaja.fecha >= fecha_desde)
    if fecha_hasta:
        q = q.filter(MovimientoCaja.fecha <= fecha_hasta)
    movs = q.order_by(MovimientoCaja.fecha.desc(), MovimientoCaja.created_at.desc()).offset(skip).limit(limit).all()
    return [_mov_to_response(m) for m in movs]


@router.post("/caja/movimientos", status_code=status.HTTP_201_CREATED)
def create_movimiento(
    body: MovimientoCajaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Registrar un movimiento de caja (entrada o salida)."""
    tipo_val = (body.tipo or "").strip().upper()
    if tipo_val not in ("ENTRADA", "SALIDA"):
        raise HTTPException(status_code=400, detail="tipo debe ser ENTRADA o SALIDA")
    if body.orden_trabajo_id:
        ot = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == body.orden_trabajo_id).first()
        if not ot:
            raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    m = MovimientoCaja(
        fecha=body.fecha,
        tipo=TipoMovimientoCajaEnum.ENTRADA if tipo_val == "ENTRADA" else TipoMovimientoCajaEnum.SALIDA,
        concepto=body.concepto.strip(),
        monto=body.monto,
        orden_trabajo_id=body.orden_trabajo_id,
        usuario_id=current_user.id,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return _mov_to_response(m)


@router.get("/caja/apertura")
def get_apertura(
    fecha: date = Query(..., description="Fecha a consultar"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Comprobar si existe apertura de caja para una fecha."""
    apertura = db.query(AperturaCaja).filter(AperturaCaja.fecha == fecha).first()
    if not apertura:
        return {"tiene_apertura": False, "monto": None}
    return {"tiene_apertura": True, "monto": float(apertura.monto), "fecha": apertura.fecha.isoformat()}


@router.post("/caja/apertura", status_code=status.HTTP_201_CREATED)
def create_apertura(
    body: AperturaCajaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Registrar apertura de caja: monto con el que se abre caja ese día (caja chica / fondo inicial). Una sola por día."""
    existente = db.query(AperturaCaja).filter(AperturaCaja.fecha == body.fecha).first()
    if existente:
        raise HTTPException(status_code=400, detail=f"Ya existe apertura de caja para la fecha {body.fecha}")
    a = AperturaCaja(fecha=body.fecha, monto=body.monto, usuario_id=current_user.id)
    db.add(a)
    db.commit()
    db.refresh(a)
    return {"id": a.id, "fecha": a.fecha.isoformat(), "monto": float(a.monto), "tiene_apertura": True}


@router.get("/caja/resumen-dia")
def resumen_dia(
    fecha: date = Query(..., description="Fecha del día"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Resumen del día (para corte caja chica o vista previa): total entradas, salidas y saldo sin cerrar."""
    entradas = db.query(func.coalesce(func.sum(MovimientoCaja.monto), 0)).filter(
        MovimientoCaja.fecha == fecha,
        MovimientoCaja.tipo == TipoMovimientoCajaEnum.ENTRADA,
    ).scalar() or 0
    salidas = db.query(func.coalesce(func.sum(MovimientoCaja.monto), 0)).filter(
        MovimientoCaja.fecha == fecha,
        MovimientoCaja.tipo == TipoMovimientoCajaEnum.SALIDA,
    ).scalar() or 0
    saldo_inicial = _saldo_inicial_para_fecha(db, fecha)
    saldo_final = float(saldo_inicial) + float(entradas) - float(salidas)
    # Indicar si hay apertura para este día (para el front)
    apertura = db.query(AperturaCaja).filter(AperturaCaja.fecha == fecha).first()
    return {
        "fecha": fecha.isoformat(),
        "saldo_inicial": round(saldo_inicial, 2),
        "tiene_apertura": apertura is not None,
        "total_entradas": round(float(entradas), 2),
        "total_salidas": round(float(salidas), 2),
        "saldo_final": round(saldo_final, 2),
    }


@router.get("/caja/cortes", response_model=List[dict])
def list_cortes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    fecha_desde: Optional[date] = Query(None),
    fecha_hasta: Optional[date] = Query(None),
    tipo: Optional[str] = Query(None, description="CAJA_CHICA o CIERRE_DIA"),
):
    """Listar cortes de caja."""
    q = db.query(CorteCaja)
    if fecha_desde:
        q = q.filter(CorteCaja.fecha >= fecha_desde)
    if fecha_hasta:
        q = q.filter(CorteCaja.fecha <= fecha_hasta)
    if tipo:
        q = q.filter(CorteCaja.tipo == tipo.upper())
    cortes = q.order_by(CorteCaja.fecha.desc(), CorteCaja.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": c.id,
            "fecha": c.fecha.isoformat() if c.fecha else None,
            "tipo": (c.tipo.value if c.tipo else "").upper(),
            "saldo_inicial": float(c.saldo_inicial),
            "total_entradas": float(c.total_entradas),
            "total_salidas": float(c.total_salidas),
            "saldo_final": float(c.saldo_final),
            "cerrado_at": c.cerrado_at,
            "usuario_cierre_id": c.usuario_cierre_id,
            "created_at": c.created_at,
        }
        for c in cortes
    ]


@router.post("/caja/cortes", status_code=status.HTTP_201_CREATED)
def create_corte(
    body: CorteCajaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION"])),
):
    """Realizar corte de caja (caja chica o cierre del día). Calcula totales del día y opcionalmente asigna movimientos al corte."""
    fecha = body.fecha
    tipo_val = (body.tipo or "CIERRE_DIA").strip().upper()
    if tipo_val not in ("CAJA_CHICA", "CIERRE_DIA"):
        raise HTTPException(status_code=400, detail="tipo debe ser CAJA_CHICA o CIERRE_DIA")

    # Ya existente corte para esta fecha y tipo?
    existente = db.query(CorteCaja).filter(CorteCaja.fecha == fecha, CorteCaja.tipo == tipo_val).first()
    if existente:
        raise HTTPException(status_code=400, detail=f"Ya existe un corte {tipo_val} para la fecha {fecha}")

    entradas = db.query(func.coalesce(func.sum(MovimientoCaja.monto), 0)).filter(
        MovimientoCaja.fecha == fecha,
        MovimientoCaja.tipo == TipoMovimientoCajaEnum.ENTRADA,
    ).scalar() or 0
    salidas = db.query(func.coalesce(func.sum(MovimientoCaja.monto), 0)).filter(
        MovimientoCaja.fecha == fecha,
        MovimientoCaja.tipo == TipoMovimientoCajaEnum.SALIDA,
    ).scalar() or 0
    saldo_inicial = body.saldo_inicial if body.saldo_inicial is not None else _saldo_inicial_para_fecha(db, fecha)
    saldo_final = float(saldo_inicial) + float(entradas) - float(salidas)

    corte = CorteCaja(
        fecha=fecha,
        tipo=TipoCorteCajaEnum.CAJA_CHICA if tipo_val == "CAJA_CHICA" else TipoCorteCajaEnum.CIERRE_DIA,
        saldo_inicial=Decimal(str(saldo_inicial)),
        total_entradas=Decimal(str(entradas)),
        total_salidas=Decimal(str(salidas)),
        saldo_final=Decimal(str(saldo_final)),
        cerrado_at=datetime.utcnow() if tipo_val == "CIERRE_DIA" else None,
        usuario_cierre_id=current_user.id if tipo_val == "CIERRE_DIA" else None,
    )
    db.add(corte)
    db.commit()
    db.refresh(corte)

    # Si es cierre del día, asociar movimientos del día a este corte
    if tipo_val == "CIERRE_DIA":
        db.query(MovimientoCaja).filter(
            MovimientoCaja.fecha == fecha,
            MovimientoCaja.corte_id.is_(None),
        ).update({MovimientoCaja.corte_id: corte.id}, synchronize_session=False)
        db.commit()

    return {
        "id": corte.id,
        "fecha": corte.fecha.isoformat(),
        "tipo": tipo_val,
        "saldo_inicial": float(corte.saldo_inicial),
        "total_entradas": float(corte.total_entradas),
        "total_salidas": float(corte.total_salidas),
        "saldo_final": float(corte.saldo_final),
        "cerrado_at": corte.cerrado_at,
        "usuario_cierre_id": corte.usuario_cierre_id,
        "created_at": corte.created_at,
    }


@router.get("/caja/cortes/{corte_id}", response_model=dict)
def get_corte(
    corte_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Obtener detalle de un corte."""
    c = db.query(CorteCaja).filter(CorteCaja.id == corte_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Corte no encontrado")
    return {
        "id": c.id,
        "fecha": c.fecha.isoformat(),
        "tipo": (c.tipo.value if c.tipo else "").upper(),
        "saldo_inicial": float(c.saldo_inicial),
        "total_entradas": float(c.total_entradas),
        "total_salidas": float(c.total_salidas),
        "saldo_final": float(c.saldo_final),
        "cerrado_at": c.cerrado_at,
        "usuario_cierre_id": c.usuario_cierre_id,
        "created_at": c.created_at,
    }


@router.get("/caja/analisis-orden/{orden_id}", response_model=dict)
def analisis_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Análisis de una OT: total gastos, total ingresos (pagos en caja) y diferencia."""
    ot = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == orden_id).first()
    if not ot:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")

    total_gastos = db.query(func.coalesce(func.sum(Gasto.monto), 0)).filter(Gasto.orden_trabajo_id == orden_id).scalar() or 0
    total_ingresos = db.query(func.coalesce(func.sum(MovimientoCaja.monto), 0)).filter(
        MovimientoCaja.orden_trabajo_id == orden_id,
        MovimientoCaja.tipo == TipoMovimientoCajaEnum.ENTRADA,
    ).scalar() or 0
    gastos_list = db.query(Gasto).filter(Gasto.orden_trabajo_id == orden_id).order_by(Gasto.fecha_gasto.desc()).all()
    ingresos_list = db.query(MovimientoCaja).filter(
        MovimientoCaja.orden_trabajo_id == orden_id,
        MovimientoCaja.tipo == TipoMovimientoCajaEnum.ENTRADA,
    ).order_by(MovimientoCaja.fecha.desc()).all()

    diferencia = float(total_ingresos) - float(total_gastos)
    cliente_nombre = None
    if ot.cliente:
        cliente_nombre = getattr(ot.cliente, "nombre", None) or getattr(ot.cliente, "razon_social", None)

    return {
        "orden_id": ot.id,
        "folio": ot.folio,
        "cliente_nombre": cliente_nombre,
        "total_gastos": round(float(total_gastos), 2),
        "total_ingresos_caja": round(float(total_ingresos), 2),
        "diferencia": round(diferencia, 2),
        "gastos": [
            {"id": g.id, "descripcion": g.descripcion, "monto": float(g.monto), "fecha_gasto": g.fecha_gasto.isoformat() if g.fecha_gasto else None}
            for g in gastos_list
        ],
        "ingresos": [_mov_to_response(m) for m in ingresos_list],
    }
