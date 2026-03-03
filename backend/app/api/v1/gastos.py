from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from decimal import Decimal

from app.database import get_db
from app.models.user import User
from app.models.gasto import Gasto, TipoGastoEnum
from app.models.orden_trabajo import OrdenTrabajo, EstadoOrdenEnum
from app.schemas.gasto import GastoCreate, GastoUpdate, GastoResponse
from app.core.dependencies import get_current_active_user, require_role

router = APIRouter(tags=["gastos"])


def _gasto_to_response(g: Gasto) -> dict:
    d = {
        "id": g.id,
        "orden_trabajo_id": g.orden_trabajo_id,
        "descripcion": g.descripcion,
        "monto": g.monto,
        "tipo": (g.tipo.value if g.tipo else "GENERAL").upper(),
        "usuario_registro_id": g.usuario_registro_id,
        "fecha_gasto": g.fecha_gasto.isoformat() if g.fecha_gasto else None,
        "created_at": g.created_at,
        "folio_orden": None,
        "nombre_registro": None,
    }
    if g.orden_trabajo:
        d["folio_orden"] = getattr(g.orden_trabajo, "folio", None)
    if g.usuario_registro:
        d["nombre_registro"] = getattr(g.usuario_registro, "nombre_completo", None)
    return d


@router.get("/gastos", response_model=List[dict])
def list_gastos(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"])),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    tipo: Optional[str] = Query(None, description="TRABAJO o GENERAL"),
    orden_trabajo_id: Optional[int] = Query(None),
    fecha_desde: Optional[date] = Query(None),
    fecha_hasta: Optional[date] = Query(None),
):
    """Listar gastos con filtros opcionales."""
    q = db.query(Gasto)
    if tipo:
        q = q.filter(Gasto.tipo == (tipo.upper() if tipo else None))
    if orden_trabajo_id is not None:
        q = q.filter(Gasto.orden_trabajo_id == orden_trabajo_id)
    if fecha_desde:
        q = q.filter(Gasto.fecha_gasto >= fecha_desde)
    if fecha_hasta:
        q = q.filter(Gasto.fecha_gasto <= fecha_hasta)
    gastos = q.order_by(Gasto.fecha_gasto.desc(), Gasto.created_at.desc()).offset(skip).limit(limit).all()
    return [_gasto_to_response(g) for g in gastos]


@router.get("/gastos/resumen")
def resumen_gastos(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"])),
    fecha_desde: Optional[date] = Query(None),
    fecha_hasta: Optional[date] = Query(None),
    tipo: Optional[str] = Query(None),
):
    """Resumen de totales por tipo y total general."""
    from sqlalchemy import func
    q = db.query(Gasto.tipo, func.sum(Gasto.monto).label("total")).group_by(Gasto.tipo)
    if fecha_desde:
        q = q.filter(Gasto.fecha_gasto >= fecha_desde)
    if fecha_hasta:
        q = q.filter(Gasto.fecha_gasto <= fecha_hasta)
    if tipo:
        q = q.filter(Gasto.tipo == tipo.upper())
    rows = q.all()
    by_tipo = { (r.tipo.value if r.tipo else "GENERAL").upper(): float(r.total) for r in rows }
    total = sum(by_tipo.values())
    return {"por_tipo": by_tipo, "total": total}


@router.get("/gastos/{gasto_id}", response_model=dict)
def get_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"])),
):
    """Obtener un gasto por ID."""
    g = db.query(Gasto).filter(Gasto.id == gasto_id).first()
    if not g:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gasto no encontrado")
    return _gasto_to_response(g)


@router.post("/gastos", status_code=status.HTTP_201_CREATED)
def create_gasto(
    body: GastoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"])),
):
    """Registrar un nuevo gasto."""
    tipo_str = (body.tipo or "GENERAL").upper()
    if tipo_str not in ("TRABAJO", "GENERAL"):
        raise HTTPException(status_code=400, detail="tipo debe ser TRABAJO o GENERAL")
    if tipo_str == "TRABAJO" and body.orden_trabajo_id:
        ot = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == body.orden_trabajo_id).first()
        if not ot:
            raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
        if ot.estatus in (EstadoOrdenEnum.ENTREGADO, EstadoOrdenEnum.FINALIZADO):
            raise HTTPException(
                status_code=400,
                detail="Solo se pueden agregar gastos a órdenes activas (no entregadas ni finalizadas)"
            )
    orden_id = body.orden_trabajo_id if tipo_str == "TRABAJO" else None
    if tipo_str == "GENERAL":
        orden_id = None
    g = Gasto(
        descripcion=body.descripcion.strip(),
        monto=body.monto,
        tipo=TipoGastoEnum(tipo_str),
        orden_trabajo_id=orden_id,
        usuario_registro_id=current_user.id,
        fecha_gasto=body.fecha_gasto,
    )
    db.add(g)
    db.commit()
    db.refresh(g)
    return _gasto_to_response(g)


@router.put("/gastos/{gasto_id}")
def update_gasto(
    gasto_id: int,
    body: GastoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"])),
):
    """Actualizar un gasto."""
    g = db.query(Gasto).filter(Gasto.id == gasto_id).first()
    if not g:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gasto no encontrado")
    data = body.dict(exclude_unset=True)
    if "tipo" in data and data["tipo"]:
        data["tipo"] = TipoGastoEnum(data["tipo"].upper())
        if data["tipo"] == TipoGastoEnum.GENERAL:
            data["orden_trabajo_id"] = None
    elif "orden_trabajo_id" in data and g.tipo == TipoGastoEnum.GENERAL:
        data["orden_trabajo_id"] = None
    # Si se asocia o cambia la OT, validar que esté activa
    if "orden_trabajo_id" in data and data["orden_trabajo_id"]:
        ot = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == data["orden_trabajo_id"]).first()
        if ot and ot.estatus in (EstadoOrdenEnum.ENTREGADO, EstadoOrdenEnum.FINALIZADO):
            raise HTTPException(
                status_code=400,
                detail="Solo se pueden asociar gastos a órdenes activas (no entregadas ni finalizadas)"
            )
    for k, v in data.items():
        setattr(g, k, v)
    db.commit()
    db.refresh(g)
    return _gasto_to_response(g)


@router.delete("/gastos/{gasto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"])),
):
    """Eliminar un gasto (solo ADMIN y CAJA)."""
    g = db.query(Gasto).filter(Gasto.id == gasto_id).first()
    if not g:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gasto no encontrado")
    db.delete(g)
    db.commit()
    return None
