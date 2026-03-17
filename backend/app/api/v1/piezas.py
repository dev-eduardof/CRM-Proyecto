from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from decimal import Decimal

from app.database import get_db
from app.models import Pieza, OrdenTrabajoPieza, OrdenTrabajo, CatalogoPieza, SubcatalogoPieza, SubOrdenTrabajo
from app.models.user import User
from app.schemas.pieza import (
    PiezaCreate,
    PiezaUpdate,
    CatalogoPiezaCreate,
    CatalogoPiezaUpdate,
    CatalogoPiezaResponse,
    SubcatalogoPiezaCreate,
    SubcatalogoPiezaUpdate,
    SubcatalogoPiezaResponse,
    OrdenTrabajoPiezaCreate,
    OrdenTrabajoPiezaUpdate,
    OrdenTrabajoPiezaResponse,
)
from app.core.dependencies import get_current_user, require_role

router = APIRouter(tags=["piezas-bodega"])


def generar_folio_pieza(db: Session) -> str:
    """Genera folio único para material/pieza: MAT-AÑO-XXXX."""
    from datetime import datetime
    anio = datetime.now().year
    count = db.query(Pieza).filter(Pieza.codigo.like(f"MAT-{anio}-%")).count()
    return f"MAT-{anio}-{(count + 1):05d}"


def _pieza_to_dict(pieza, mask_price: bool = False):
    """Serializa una pieza; si mask_price=True (no admin), precio siempre 0."""
    d = {
        "id": pieza.id,
        "codigo": pieza.codigo,
        "catalogo_id": getattr(pieza, "catalogo_id", None),
        "subcatalogo_id": getattr(pieza, "subcatalogo_id", None),
        "nombre": pieza.nombre,
        "descripcion": pieza.descripcion,
        "precio": 0 if mask_price else float(pieza.precio or 0),
        "stock": pieza.stock,
        "unidad": pieza.unidad,
        "activo": pieza.activo,
        "created_at": pieza.created_at,
        "updated_at": pieza.updated_at,
        "catalogo_nombre": pieza.catalogo.nombre if getattr(pieza, "catalogo", None) else None,
        "subcatalogo_nombre": pieza.subcatalogo.nombre if getattr(pieza, "subcatalogo", None) else None,
    }
    return d


@router.get("/piezas")
def list_piezas(
    activo: Optional[bool] = None,
    search: Optional[str] = Query(None, description="Buscar por nombre o código"),
    catalogo_id: Optional[int] = Query(None),
    subcatalogo_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Listar piezas del almacén. Solo ADMIN ve precios; taller/recepción ven precio 0."""
    q = db.query(Pieza).options(
        joinedload(Pieza.catalogo),
        joinedload(Pieza.subcatalogo),
    )
    if activo is not None:
        q = q.filter(Pieza.activo == activo)
    if catalogo_id is not None:
        q = q.filter(Pieza.catalogo_id == catalogo_id)
    if subcatalogo_id is not None:
        q = q.filter(Pieza.subcatalogo_id == subcatalogo_id)
    if search:
        t = f"%{search.strip()}%"
        q = q.filter((Pieza.nombre.ilike(t)) | (Pieza.codigo.ilike(t)))
    items = q.order_by(Pieza.nombre).offset(skip).limit(limit).all()
    mask = current_user.rol.value != "ADMIN"
    return [_pieza_to_dict(p, mask_price=mask) for p in items]


@router.post("/piezas", status_code=status.HTTP_201_CREATED)
def create_pieza(
    body: PiezaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Crear una nueva pieza/material en bodega. Si no se envía código se genera folio MAT-AÑO-XXXX."""
    data = body.model_dump()
    codigo = (data.get("codigo") or "").strip() if data.get("codigo") else None
    if not codigo:
        data["codigo"] = generar_folio_pieza(db)
    else:
        existing = db.query(Pieza).filter(Pieza.codigo == codigo).first()
        if existing:
            raise HTTPException(status_code=400, detail="Ya existe una pieza con ese código")
    if current_user.rol.value != "ADMIN":
        data["precio"] = Decimal("0.00")
    pieza = Pieza(**data)
    db.add(pieza)
    db.commit()
    db.refresh(pieza)
    mask = current_user.rol.value != "ADMIN"
    return _pieza_to_dict(pieza, mask_price=mask)


@router.get("/piezas/{pieza_id}")
def get_pieza(
    pieza_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Obtener una pieza por ID. Solo ADMIN ve el precio real."""
    pieza = db.query(Pieza).options(
        joinedload(Pieza.catalogo),
        joinedload(Pieza.subcatalogo),
    ).filter(Pieza.id == pieza_id).first()
    if not pieza:
        raise HTTPException(status_code=404, detail="Pieza no encontrada")
    return _pieza_to_dict(pieza, mask_price=(current_user.rol.value != "ADMIN"))


@router.put("/piezas/{pieza_id}")
def update_pieza(
    pieza_id: int,
    body: PiezaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Actualizar una pieza. Solo ADMIN puede cambiar el precio."""
    pieza = db.query(Pieza).filter(Pieza.id == pieza_id).first()
    if not pieza:
        raise HTTPException(status_code=404, detail="Pieza no encontrada")
    data = body.model_dump(exclude_unset=True)
    if current_user.rol.value != "ADMIN":
        data.pop("precio", None)
    if data.get("codigo") is not None and data["codigo"]:
        other = db.query(Pieza).filter(Pieza.codigo == data["codigo"].strip(), Pieza.id != pieza_id).first()
        if other:
            raise HTTPException(status_code=400, detail="Ya existe otra pieza con ese código")
    for k, v in data.items():
        setattr(pieza, k, v)
    db.commit()
    db.refresh(pieza)
    return _pieza_to_dict(pieza, mask_price=(current_user.rol.value != "ADMIN"))


@router.delete("/piezas/{pieza_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pieza(
    pieza_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"])),
):
    """Eliminar una pieza (solo si no está en uso en ninguna OT)."""
    pieza = db.query(Pieza).filter(Pieza.id == pieza_id).first()
    if not pieza:
        raise HTTPException(status_code=404, detail="Pieza no encontrada")
    usos = db.query(OrdenTrabajoPieza).filter(OrdenTrabajoPieza.pieza_id == pieza_id).count()
    if usos > 0:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar: la pieza está usada en {usos} orden(es) de trabajo",
        )
    db.delete(pieza)
    db.commit()
    return None


# --- Catálogo y subcatálogo (mecánico) ---

@router.get("/catalogos-pieza", response_model=List[CatalogoPiezaResponse])
def list_catalogos_pieza(
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Listar catálogos de materiales."""
    q = db.query(CatalogoPieza)
    if activo is not None:
        q = q.filter(CatalogoPieza.activo == activo)
    return q.order_by(CatalogoPieza.nombre).all()


@router.post("/catalogos-pieza", response_model=CatalogoPiezaResponse, status_code=status.HTTP_201_CREATED)
def create_catalogo_pieza(
    body: CatalogoPiezaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Crear nuevo catálogo."""
    c = CatalogoPieza(**body.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/catalogos-pieza/eliminar-todos", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_catalogos_pieza(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"])),
):
    """Elimina todas las categorías y subcategorías. Las piezas quedan sin categoría (solo ADMIN)."""
    db.query(CatalogoPieza).delete()
    db.commit()
    return None


@router.get("/catalogos-pieza/{catalogo_id}", response_model=CatalogoPiezaResponse)
def get_catalogo_pieza(
    catalogo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    cat = db.query(CatalogoPieza).filter(CatalogoPieza.id == catalogo_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Catálogo no encontrado")
    return cat


@router.put("/catalogos-pieza/{catalogo_id}", response_model=CatalogoPiezaResponse)
def update_catalogo_pieza(
    catalogo_id: int,
    body: CatalogoPiezaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    cat = db.query(CatalogoPieza).filter(CatalogoPieza.id == catalogo_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Catálogo no encontrado")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/catalogos-pieza/{catalogo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_catalogo_pieza(
    catalogo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    cat = db.query(CatalogoPieza).filter(CatalogoPieza.id == catalogo_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Catálogo no encontrado")
    db.delete(cat)
    db.commit()
    return None


@router.get("/catalogos-pieza/{catalogo_id}/subcatalogos", response_model=List[SubcatalogoPiezaResponse])
def list_subcatalogos_pieza(
    catalogo_id: int,
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    q = db.query(SubcatalogoPieza).filter(SubcatalogoPieza.catalogo_id == catalogo_id)
    if activo is not None:
        q = q.filter(SubcatalogoPieza.activo == activo)
    return q.order_by(SubcatalogoPieza.nombre).all()


@router.post("/subcatalogos-pieza", response_model=SubcatalogoPiezaResponse, status_code=status.HTTP_201_CREATED)
def create_subcatalogo_pieza(
    body: SubcatalogoPiezaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Crear nuevo subcatálogo dentro de un catálogo."""
    sub = SubcatalogoPieza(**body.model_dump())
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.get("/subcatalogos-pieza/{subcatalogo_id}", response_model=SubcatalogoPiezaResponse)
def get_subcatalogo_pieza(
    subcatalogo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    sub = db.query(SubcatalogoPieza).filter(SubcatalogoPieza.id == subcatalogo_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subcatálogo no encontrado")
    return sub


@router.put("/subcatalogos-pieza/{subcatalogo_id}", response_model=SubcatalogoPiezaResponse)
def update_subcatalogo_pieza(
    subcatalogo_id: int,
    body: SubcatalogoPiezaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    sub = db.query(SubcatalogoPieza).filter(SubcatalogoPieza.id == subcatalogo_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subcatálogo no encontrado")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(sub, k, v)
    db.commit()
    db.refresh(sub)
    return sub


@router.delete("/subcatalogos-pieza/{subcatalogo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subcatalogo_pieza(
    subcatalogo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    sub = db.query(SubcatalogoPieza).filter(SubcatalogoPieza.id == subcatalogo_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subcatálogo no encontrado")
    db.delete(sub)
    db.commit()
    return None


# --- Agregar / quitar piezas en una OT ---

def _uso_to_response(u: OrdenTrabajoPieza, mask_price: bool = False) -> dict:
    subtotal = 0.0 if mask_price else (float(u.precio_unitario or 0) * int(u.cantidad or 0))
    return {
        "id": u.id,
        "orden_trabajo_id": u.orden_trabajo_id,
        "sub_orden_id": getattr(u, "sub_orden_id", None),
        "pieza_id": u.pieza_id,
        "pieza_nombre": u.pieza.nombre if u.pieza else None,
        "pieza_codigo": getattr(u.pieza, "codigo", None) if u.pieza else None,
        "cantidad": u.cantidad,
        "precio_unitario": 0.0 if mask_price else float(u.precio_unitario or 0),
        "subtotal": round(subtotal, 2),
    }


@router.post("/ordenes/{orden_id}/piezas", response_model=OrdenTrabajoPiezaResponse, status_code=status.HTTP_201_CREATED)
def add_pieza_to_orden(
    orden_id: int,
    body: OrdenTrabajoPiezaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Agregar pieza a una orden de trabajo. Descuenta del stock. Precio se guarda al momento de agregar."""
    orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == orden_id).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    if current_user.rol.value == "TECNICO" and orden.tecnico_asignado_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta orden")

    pieza = db.query(Pieza).filter(Pieza.id == body.pieza_id).first()
    if not pieza:
        raise HTTPException(status_code=404, detail="Pieza no encontrada")
    if not pieza.activo:
        raise HTTPException(status_code=400, detail="La pieza no está activa")
    if pieza.stock < body.cantidad:
        raise HTTPException(
            status_code=400,
            detail=f"Stock insuficiente. Disponible: {pieza.stock}, solicitado: {body.cantidad}",
        )

    sub_orden_id = getattr(body, "sub_orden_id", None)
    if sub_orden_id is not None:
        sub = db.query(SubOrdenTrabajo).filter(
            SubOrdenTrabajo.id == sub_orden_id,
            SubOrdenTrabajo.orden_trabajo_id == orden_id,
        ).first()
        if not sub:
            raise HTTPException(status_code=400, detail="Sub-orden no encontrada o no pertenece a esta OT")

    precio_unit = body.precio_unitario
    if current_user.rol.value != "ADMIN":
        precio_unit = pieza.precio  # Taller no puede asignar precio; usa el de la pieza (0 para ellos)
    elif precio_unit is None:
        precio_unit = pieza.precio

    uso = OrdenTrabajoPieza(
        orden_trabajo_id=orden_id,
        sub_orden_id=sub_orden_id,
        pieza_id=pieza.id,
        cantidad=body.cantidad,
        precio_unitario=precio_unit,
    )
    db.add(uso)
    pieza.stock -= body.cantidad
    db.commit()
    db.refresh(uso)
    db.refresh(pieza)
    # Cargar relación pieza para respuesta
    uso = db.query(OrdenTrabajoPieza).options(joinedload(OrdenTrabajoPieza.pieza)).filter(OrdenTrabajoPieza.id == uso.id).first()
    resp = _uso_to_response(uso, mask_price=(current_user.rol.value != "ADMIN"))
    return OrdenTrabajoPiezaResponse(**resp)


@router.patch("/ordenes/{orden_id}/piezas/{uso_id}", response_model=OrdenTrabajoPiezaResponse)
def update_pieza_en_orden(
    orden_id: int,
    uso_id: int,
    body: OrdenTrabajoPiezaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Actualizar cantidad y/o precio unitario de un uso de pieza en la OT. Solo ADMIN puede cambiar el precio."""
    uso = (
        db.query(OrdenTrabajoPieza)
        .options(joinedload(OrdenTrabajoPieza.pieza), joinedload(OrdenTrabajoPieza.orden_trabajo))
        .filter(OrdenTrabajoPieza.id == uso_id, OrdenTrabajoPieza.orden_trabajo_id == orden_id)
        .first()
    )
    if not uso:
        raise HTTPException(status_code=404, detail="Uso de pieza no encontrado en esta orden")
    if current_user.rol.value == "TECNICO" and uso.orden_trabajo.tecnico_asignado_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta orden")
    data = body.model_dump(exclude_unset=True)
    if current_user.rol.value != "ADMIN":
        data.pop("precio_unitario", None)
    if "cantidad" in data:
        nueva_cant = data["cantidad"]
        delta = nueva_cant - uso.cantidad
        if uso.pieza and delta != 0:
            if delta > 0 and uso.pieza.stock < delta:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente. Disponible: {uso.pieza.stock}, necesario extra: {delta}",
                )
            uso.pieza.stock -= delta
        uso.cantidad = nueva_cant
    if "precio_unitario" in data:
        uso.precio_unitario = data["precio_unitario"]
    db.commit()
    db.refresh(uso)
    uso = db.query(OrdenTrabajoPieza).options(joinedload(OrdenTrabajoPieza.pieza)).filter(OrdenTrabajoPieza.id == uso.id).first()
    return OrdenTrabajoPiezaResponse(**_uso_to_response(uso, mask_price=(current_user.rol.value != "ADMIN")))


@router.delete("/ordenes/{orden_id}/piezas/{uso_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_pieza_from_orden(
    orden_id: int,
    uso_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Quitar un uso de pieza de la OT. Devuelve la cantidad al stock."""
    uso = (
        db.query(OrdenTrabajoPieza)
        .options(joinedload(OrdenTrabajoPieza.pieza), joinedload(OrdenTrabajoPieza.orden_trabajo))
        .filter(OrdenTrabajoPieza.id == uso_id, OrdenTrabajoPieza.orden_trabajo_id == orden_id)
        .first()
    )
    if not uso:
        raise HTTPException(status_code=404, detail="Uso de pieza no encontrado en esta orden")
    if current_user.rol.value == "TECNICO" and uso.orden_trabajo.tecnico_asignado_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta orden")

    pieza = uso.pieza
    if pieza:
        pieza.stock += uso.cantidad
    db.delete(uso)
    db.commit()
    return None


@router.get("/ordenes/{orden_id}/piezas", response_model=List[OrdenTrabajoPiezaResponse])
def list_piezas_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"])),
):
    """Listar piezas usadas en una orden de trabajo."""
    orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == orden_id).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    if current_user.rol.value == "TECNICO" and orden.tecnico_asignado_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta orden")

    usos = (
        db.query(OrdenTrabajoPieza)
        .options(joinedload(OrdenTrabajoPieza.pieza))
        .filter(OrdenTrabajoPieza.orden_trabajo_id == orden_id)
        .all()
    )
    mask = current_user.rol.value != "ADMIN"
    return [_uso_to_response(u, mask_price=mask) for u in usos]
