from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
import os
import shutil
from app.database import get_db
from app.models import (
    OrdenTrabajo, Cliente, User, CategoriaOrden, SubcategoriaOrden, 
    SubtareaOrden, EstadoOrdenEnum
)
from app.schemas import (
    OrdenTrabajoCreate,
    OrdenTrabajoUpdate,
    OrdenTrabajoResponse,
    OrdenTrabajoListResponse,
    CambiarEstadoOrden,
    CategoriaOrdenCreate,
    CategoriaOrdenResponse,
    SubcategoriaOrdenCreate,
    SubcategoriaOrdenResponse,
    SubtareaOrdenBase,
    SubtareaOrdenCreate,
    SubtareaOrdenUpdate,
    SubtareaOrdenResponse
)
from app.core.dependencies import get_current_user, require_role

router = APIRouter(tags=["ordenes"])

# Crear directorio para fotos si no existe
UPLOAD_DIR = "uploads/ordenes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def generar_folio(db: Session) -> str:
    """Genera un folio único para la orden de trabajo"""
    from datetime import datetime
    
    anio_actual = datetime.now().year
    count = db.query(OrdenTrabajo).filter(
        OrdenTrabajo.folio.like(f"OT-{anio_actual}-%")
    ).count()
    
    numero = count + 1
    folio = f"OT-{anio_actual}-{numero:04d}"
    
    return folio


# ==================== ENDPOINTS DE CATEGORÍAS ====================

@router.get("/categorias", response_model=List[CategoriaOrdenResponse])
def get_categorias(
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener todas las categorías"""
    query = db.query(CategoriaOrden)
    if activo is not None:
        query = query.filter(CategoriaOrden.activo == activo)
    return query.all()


@router.post("/categorias", response_model=CategoriaOrdenResponse, status_code=status.HTTP_201_CREATED)
def create_categoria(
    categoria: CategoriaOrdenCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """Crear una nueva categoría (solo ADMIN)"""
    db_categoria = CategoriaOrden(**categoria.model_dump())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria


@router.get("/categorias/{categoria_id}/subcategorias", response_model=List[SubcategoriaOrdenResponse])
def get_subcategorias(
    categoria_id: int,
    activo: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener subcategorías de una categoría"""
    query = db.query(SubcategoriaOrden).filter(SubcategoriaOrden.categoria_id == categoria_id)
    if activo is not None:
        query = query.filter(SubcategoriaOrden.activo == activo)
    return query.all()


@router.post("/subcategorias", response_model=SubcategoriaOrdenResponse, status_code=status.HTTP_201_CREATED)
def create_subcategoria(
    subcategoria: SubcategoriaOrdenCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """Crear una nueva subcategoría (solo ADMIN)"""
    db_subcategoria = SubcategoriaOrden(**subcategoria.model_dump())
    db.add(db_subcategoria)
    db.commit()
    db.refresh(db_subcategoria)
    return db_subcategoria


# ==================== ENDPOINTS DE ÓRDENES ====================

@router.get("/ordenes", response_model=List[OrdenTrabajoListResponse])
def get_ordenes(
    skip: int = 0,
    limit: int = 100,
    estatus: Optional[str] = None,
    cliente_id: Optional[int] = None,
    tecnico_id: Optional[int] = None,
    categoria_id: Optional[int] = None,
    prioridad: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"]))
):
    """Obtener lista de órdenes de trabajo con filtros"""
    query = db.query(OrdenTrabajo).options(
        joinedload(OrdenTrabajo.cliente),
        joinedload(OrdenTrabajo.tecnico),
        joinedload(OrdenTrabajo.usuario_recepcion),
        joinedload(OrdenTrabajo.categoria),
        joinedload(OrdenTrabajo.subcategoria),
        joinedload(OrdenTrabajo.subtareas)
    )
    
    # Si es técnico, solo ver sus órdenes asignadas
    if current_user.rol.value == "TECNICO":
        query = query.filter(OrdenTrabajo.tecnico_asignado_id == current_user.id)
    
    # Filtros
    if estatus:
        query = query.filter(OrdenTrabajo.estatus == estatus)
    
    if cliente_id:
        query = query.filter(OrdenTrabajo.cliente_id == cliente_id)
    
    if tecnico_id:
        query = query.filter(OrdenTrabajo.tecnico_asignado_id == tecnico_id)
    
    if categoria_id:
        query = query.filter(OrdenTrabajo.categoria_id == categoria_id)
    
    if prioridad:
        query = query.filter(OrdenTrabajo.prioridad == prioridad)
    
    if search:
        search_filter = f"%{search}%"
        query = query.join(Cliente).filter(
            (OrdenTrabajo.folio.ilike(search_filter)) |
            (OrdenTrabajo.descripcion.ilike(search_filter)) |
            (Cliente.nombre.ilike(search_filter))
        )
    
    ordenes = query.order_by(OrdenTrabajo.fecha_recepcion.desc()).offset(skip).limit(limit).all()
    
    # Preparar respuesta
    result = []
    for orden in ordenes:
        orden_dict = {
            "id": orden.id,
            "folio": orden.folio,
            "cliente_id": orden.cliente_id,
            "cliente_nombre": orden.cliente.nombre_completo if orden.cliente else None,
            "categoria_nombre": orden.categoria.nombre if orden.categoria else None,
            "subcategoria_nombre": orden.subcategoria.nombre if orden.subcategoria else None,
            "descripcion": orden.descripcion,
            "estatus": orden.estatus.value,
            "prioridad": orden.prioridad.value,
            "fecha_recepcion": orden.fecha_recepcion,
            "fecha_promesa": orden.fecha_promesa,
            "tecnico_nombre": orden.tecnico.nombre_completo if orden.tecnico else None,
            "precio_final": orden.precio_final,
            "dias_desde_recepcion": orden.dias_desde_recepcion,
            "esta_retrasada": orden.esta_retrasada,
            "porcentaje_completado": orden.porcentaje_completado
        }
        result.append(OrdenTrabajoListResponse(**orden_dict))
    
    return result


@router.get("/ordenes/{orden_id}", response_model=OrdenTrabajoResponse)
def get_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"]))
):
    """Obtener una orden de trabajo específica"""
    orden = db.query(OrdenTrabajo).options(
        joinedload(OrdenTrabajo.cliente),
        joinedload(OrdenTrabajo.tecnico),
        joinedload(OrdenTrabajo.usuario_recepcion),
        joinedload(OrdenTrabajo.categoria),
        joinedload(OrdenTrabajo.subcategoria),
        joinedload(OrdenTrabajo.subtareas).joinedload(SubtareaOrden.tecnico)
    ).filter(OrdenTrabajo.id == orden_id).first()
    
    if not orden:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    
    # Si es técnico, solo puede ver sus órdenes
    if current_user.rol.value == "TECNICO" and orden.tecnico_asignado_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta orden")
    
    # Preparar respuesta
    orden_dict = {
        **orden.__dict__,
        "cliente_nombre": orden.cliente.nombre_completo if orden.cliente else None,
        "categoria_nombre": orden.categoria.nombre if orden.categoria else None,
        "subcategoria_nombre": orden.subcategoria.nombre if orden.subcategoria else None,
        "tecnico_nombre": orden.tecnico.nombre_completo if orden.tecnico else None,
        "usuario_recepcion_nombre": orden.usuario_recepcion.nombre_completo if orden.usuario_recepcion else None,
        "dias_desde_recepcion": orden.dias_desde_recepcion,
        "esta_retrasada": orden.esta_retrasada,
        "saldo_pendiente": orden.saldo_pendiente,
        "porcentaje_completado": orden.porcentaje_completado,
        "subtareas": [
            {
                **st.__dict__,
                "tecnico_nombre": st.tecnico.nombre_completo if st.tecnico else None
            }
            for st in orden.subtareas
        ]
    }
    
    return OrdenTrabajoResponse(**orden_dict)


@router.post("/ordenes", response_model=OrdenTrabajoResponse, status_code=status.HTTP_201_CREATED)
def create_orden(
    orden: OrdenTrabajoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION"]))
):
    """Crear una nueva orden de trabajo"""
    # Verificar que el cliente existe
    cliente = db.query(Cliente).filter(Cliente.id == orden.cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Verificar técnico si se asignó
    if orden.tecnico_asignado_id:
        tecnico = db.query(User).filter(
            User.id == orden.tecnico_asignado_id,
            User.rol == "TECNICO"
        ).first()
        if not tecnico:
            raise HTTPException(status_code=404, detail="Técnico no encontrado")
    
    # Generar folio
    folio = generar_folio(db)
    
    # Crear la orden
    db_orden = OrdenTrabajo(
        **orden.model_dump(),
        folio=folio,
        usuario_recepcion_id=current_user.id
    )
    
    db.add(db_orden)
    db.commit()
    db.refresh(db_orden)
    
    # Cargar relaciones
    db_orden = db.query(OrdenTrabajo).options(
        joinedload(OrdenTrabajo.cliente),
        joinedload(OrdenTrabajo.tecnico),
        joinedload(OrdenTrabajo.usuario_recepcion),
        joinedload(OrdenTrabajo.categoria),
        joinedload(OrdenTrabajo.subcategoria),
        joinedload(OrdenTrabajo.subtareas)
    ).filter(OrdenTrabajo.id == db_orden.id).first()
    
    # Preparar respuesta
    orden_dict = {
        **db_orden.__dict__,
        "cliente_nombre": db_orden.cliente.nombre_completo if db_orden.cliente else None,
        "categoria_nombre": db_orden.categoria.nombre if db_orden.categoria else None,
        "subcategoria_nombre": db_orden.subcategoria.nombre if db_orden.subcategoria else None,
        "tecnico_nombre": db_orden.tecnico.nombre_completo if db_orden.tecnico else None,
        "usuario_recepcion_nombre": db_orden.usuario_recepcion.nombre_completo if db_orden.usuario_recepcion else None,
        "dias_desde_recepcion": db_orden.dias_desde_recepcion,
        "esta_retrasada": db_orden.esta_retrasada,
        "saldo_pendiente": db_orden.saldo_pendiente,
        "porcentaje_completado": db_orden.porcentaje_completado,
        "subtareas": []
    }
    
    return OrdenTrabajoResponse(**orden_dict)


@router.put("/ordenes/{orden_id}", response_model=OrdenTrabajoResponse)
def update_orden(
    orden_id: int,
    orden_update: OrdenTrabajoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"]))
):
    """Actualizar una orden de trabajo"""
    db_orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == orden_id).first()
    
    if not db_orden:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    
    # Si es técnico, solo puede actualizar sus órdenes y campos limitados
    if current_user.rol.value == "TECNICO":
        if db_orden.tecnico_asignado_id != current_user.id:
            raise HTTPException(status_code=403, detail="No tienes permiso para editar esta orden")
        
        allowed_fields = ["descripcion", "observaciones", "estatus"]
        update_data = orden_update.model_dump(exclude_unset=True)
        update_data = {k: v for k, v in update_data.items() if k in allowed_fields}
    else:
        update_data = orden_update.model_dump(exclude_unset=True)
    
    # Actualizar campos
    for field, value in update_data.items():
        setattr(db_orden, field, value)
    
    db.commit()
    db.refresh(db_orden)
    
    # Cargar relaciones
    db_orden = db.query(OrdenTrabajo).options(
        joinedload(OrdenTrabajo.cliente),
        joinedload(OrdenTrabajo.tecnico),
        joinedload(OrdenTrabajo.usuario_recepcion),
        joinedload(OrdenTrabajo.categoria),
        joinedload(OrdenTrabajo.subcategoria),
        joinedload(OrdenTrabajo.subtareas).joinedload(SubtareaOrden.tecnico)
    ).filter(OrdenTrabajo.id == db_orden.id).first()
    
    # Preparar respuesta
    orden_dict = {
        **db_orden.__dict__,
        "cliente_nombre": db_orden.cliente.nombre_completo if db_orden.cliente else None,
        "categoria_nombre": db_orden.categoria.nombre if db_orden.categoria else None,
        "subcategoria_nombre": db_orden.subcategoria.nombre if db_orden.subcategoria else None,
        "tecnico_nombre": db_orden.tecnico.nombre_completo if db_orden.tecnico else None,
        "usuario_recepcion_nombre": db_orden.usuario_recepcion.nombre_completo if db_orden.usuario_recepcion else None,
        "dias_desde_recepcion": db_orden.dias_desde_recepcion,
        "esta_retrasada": db_orden.esta_retrasada,
        "saldo_pendiente": db_orden.saldo_pendiente,
        "porcentaje_completado": db_orden.porcentaje_completado,
        "subtareas": [
            {
                **st.__dict__,
                "tecnico_nombre": st.tecnico.nombre_completo if st.tecnico else None
            }
            for st in db_orden.subtareas
        ]
    }
    
    return OrdenTrabajoResponse(**orden_dict)


@router.patch("/ordenes/{orden_id}/estado", response_model=OrdenTrabajoResponse)
def cambiar_estado_orden(
    orden_id: int,
    cambio_estado: CambiarEstadoOrden,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"]))
):
    """Cambiar el estado de una orden de trabajo"""
    db_orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == orden_id).first()
    
    if not db_orden:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    
    # Validar el estado
    try:
        nuevo_estado = EstadoOrdenEnum(cambio_estado.estatus)
    except ValueError:
        raise HTTPException(status_code=400, detail="Estado no válido")
    
    # Actualizar estado
    db_orden.estatus = nuevo_estado
    
    # Actualizar fechas según el estado
    if nuevo_estado == EstadoOrdenEnum.PROCESO and not db_orden.fecha_inicio_trabajo:
        db_orden.fecha_inicio_trabajo = datetime.now()
    elif nuevo_estado == EstadoOrdenEnum.TERMINADO and not db_orden.fecha_terminado:
        db_orden.fecha_terminado = datetime.now()
    elif nuevo_estado == EstadoOrdenEnum.ENTREGADO and not db_orden.fecha_entrega:
        db_orden.fecha_entrega = datetime.now()
    
    # Agregar observaciones
    if cambio_estado.observaciones:
        if db_orden.observaciones:
            db_orden.observaciones += f"\n\n[{datetime.now().strftime('%Y-%m-%d %H:%M')}] {cambio_estado.observaciones}"
        else:
            db_orden.observaciones = f"[{datetime.now().strftime('%Y-%m-%d %H:%M')}] {cambio_estado.observaciones}"
    
    db.commit()
    db.refresh(db_orden)
    
    # Cargar relaciones y preparar respuesta
    db_orden = db.query(OrdenTrabajo).options(
        joinedload(OrdenTrabajo.cliente),
        joinedload(OrdenTrabajo.tecnico),
        joinedload(OrdenTrabajo.usuario_recepcion),
        joinedload(OrdenTrabajo.categoria),
        joinedload(OrdenTrabajo.subcategoria),
        joinedload(OrdenTrabajo.subtareas).joinedload(SubtareaOrden.tecnico)
    ).filter(OrdenTrabajo.id == db_orden.id).first()
    
    orden_dict = {
        **db_orden.__dict__,
        "cliente_nombre": db_orden.cliente.nombre_completo if db_orden.cliente else None,
        "categoria_nombre": db_orden.categoria.nombre if db_orden.categoria else None,
        "subcategoria_nombre": db_orden.subcategoria.nombre if db_orden.subcategoria else None,
        "tecnico_nombre": db_orden.tecnico.nombre_completo if db_orden.tecnico else None,
        "usuario_recepcion_nombre": db_orden.usuario_recepcion.nombre_completo if db_orden.usuario_recepcion else None,
        "dias_desde_recepcion": db_orden.dias_desde_recepcion,
        "esta_retrasada": db_orden.esta_retrasada,
        "saldo_pendiente": db_orden.saldo_pendiente,
        "porcentaje_completado": db_orden.porcentaje_completado,
        "subtareas": [
            {
                **st.__dict__,
                "tecnico_nombre": st.tecnico.nombre_completo if st.tecnico else None
            }
            for st in db_orden.subtareas
        ]
    }
    
    return OrdenTrabajoResponse(**orden_dict)


@router.post("/ordenes/{orden_id}/foto")
async def upload_foto(
    orden_id: int,
    tipo: str = Query(..., description="Tipo de foto: 'entrada' o 'salida'"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"]))
):
    """Subir foto de la pieza"""
    db_orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == orden_id).first()
    
    if not db_orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    # Validar tipo
    if tipo not in ["entrada", "salida"]:
        raise HTTPException(status_code=400, detail="Tipo debe ser 'entrada' o 'salida'")
    
    # Generar nombre único
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{db_orden.folio}_{tipo}_{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Guardar archivo
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Actualizar base de datos
    if tipo == "entrada":
        db_orden.foto_entrada = f"/uploads/ordenes/{filename}"
    else:
        db_orden.foto_salida = f"/uploads/ordenes/{filename}"
    
    db.commit()
    
    return {"message": "Foto subida correctamente", "url": f"/uploads/ordenes/{filename}"}


# ==================== ENDPOINTS DE SUBTAREAS ====================

@router.post("/ordenes/{orden_id}/subtareas", response_model=SubtareaOrdenResponse, status_code=status.HTTP_201_CREATED)
def create_subtarea(
    orden_id: int,
    subtarea: SubtareaOrdenBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"]))
):
    """Agregar una subtarea a una orden"""
    orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == orden_id).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    db_subtarea = SubtareaOrden(
        **subtarea.model_dump(),
        orden_trabajo_id=orden_id
    )
    
    db.add(db_subtarea)
    db.commit()
    db.refresh(db_subtarea)
    
    # Cargar técnico si existe
    if db_subtarea.tecnico_asignado_id:
        db_subtarea = db.query(SubtareaOrden).options(
            joinedload(SubtareaOrden.tecnico)
        ).filter(SubtareaOrden.id == db_subtarea.id).first()
    
    subtarea_dict = {
        **db_subtarea.__dict__,
        "tecnico_nombre": db_subtarea.tecnico.nombre_completo if db_subtarea.tecnico else None
    }
    
    return SubtareaOrdenResponse(**subtarea_dict)


@router.put("/subtareas/{subtarea_id}", response_model=SubtareaOrdenResponse)
def update_subtarea(
    subtarea_id: int,
    subtarea_update: SubtareaOrdenUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"]))
):
    """Actualizar una subtarea"""
    db_subtarea = db.query(SubtareaOrden).filter(SubtareaOrden.id == subtarea_id).first()
    
    if not db_subtarea:
        raise HTTPException(status_code=404, detail="Subtarea no encontrada")
    
    update_data = subtarea_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_subtarea, field, value)
    
    db.commit()
    db.refresh(db_subtarea)
    
    # Cargar técnico
    db_subtarea = db.query(SubtareaOrden).options(
        joinedload(SubtareaOrden.tecnico)
    ).filter(SubtareaOrden.id == db_subtarea.id).first()
    
    subtarea_dict = {
        **db_subtarea.__dict__,
        "tecnico_nombre": db_subtarea.tecnico.nombre_completo if db_subtarea.tecnico else None
    }
    
    return SubtareaOrdenResponse(**subtarea_dict)


@router.delete("/subtareas/{subtarea_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subtarea(
    subtarea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION"]))
):
    """Eliminar una subtarea"""
    db_subtarea = db.query(SubtareaOrden).filter(SubtareaOrden.id == subtarea_id).first()
    
    if not db_subtarea:
        raise HTTPException(status_code=404, detail="Subtarea no encontrada")
    
    db.delete(db_subtarea)
    db.commit()
    
    return None


@router.delete("/ordenes/{orden_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """Eliminar una orden de trabajo (solo ADMIN)"""
    db_orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == orden_id).first()
    
    if not db_orden:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    
    # Solo permitir eliminar órdenes en estado RECIBIDO
    if db_orden.estatus != EstadoOrdenEnum.RECIBIDO:
        raise HTTPException(
            status_code=400,
            detail="Solo se pueden eliminar órdenes en estado RECIBIDO"
        )
    
    db.delete(db_orden)
    db.commit()
    
    return None
