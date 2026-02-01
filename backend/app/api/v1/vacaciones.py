from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.models.user import User
from app.models.solicitud_vacaciones import SolicitudVacaciones, EstadoSolicitudEnum
from app.schemas.solicitud_vacaciones import (
    SolicitudVacacionesCreate,
    SolicitudVacacionesUpdate,
    SolicitudVacacionesAprobacion,
    SolicitudVacacionesResponse
)
from app.core.dependencies import get_current_active_user, require_role

router = APIRouter(
    prefix="/vacaciones",
    tags=["Vacaciones"]
)


@router.get("/", response_model=List[SolicitudVacacionesResponse])
def get_solicitudes_vacaciones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    empleado_id: Optional[int] = None,
    estado: Optional[EstadoSolicitudEnum] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    skip: int = 0,
    limit: int = 100
):
    """
    Obtener solicitudes de vacaciones.
    - Los empleados solo ven sus propias solicitudes
    - Los ADMIN pueden ver todas las solicitudes
    """
    query = db.query(SolicitudVacaciones)
    
    # Si no es ADMIN, solo puede ver sus propias solicitudes
    if current_user.rol.value != "ADMIN":
        query = query.filter(SolicitudVacaciones.empleado_id == current_user.id)
    elif empleado_id:
        query = query.filter(SolicitudVacaciones.empleado_id == empleado_id)
    
    if estado:
        query = query.filter(SolicitudVacaciones.estado == estado)
    
    if fecha_desde:
        query = query.filter(SolicitudVacaciones.fecha_inicio >= fecha_desde)
    
    if fecha_hasta:
        query = query.filter(SolicitudVacaciones.fecha_fin <= fecha_hasta)
    
    solicitudes = query.order_by(SolicitudVacaciones.fecha_solicitud.desc()).offset(skip).limit(limit).all()
    
    # Agregar nombres de empleado y aprobador
    result = []
    for solicitud in solicitudes:
        solicitud_dict = SolicitudVacacionesResponse.from_orm(solicitud).dict()
        solicitud_dict['empleado_nombre'] = solicitud.empleado.nombre_completo
        if solicitud.aprobada_por_id:
            solicitud_dict['aprobada_por_nombre'] = solicitud.aprobada_por.nombre_completo
        result.append(solicitud_dict)
    
    return result


@router.get("/mis-vacaciones", response_model=dict)
def get_mis_vacaciones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtener resumen de vacaciones del usuario actual
    """
    # Actualizar días de vacaciones según antigüedad
    current_user.actualizar_dias_vacaciones()
    db.commit()
    
    return {
        "empleado_id": current_user.id,
        "nombre_completo": current_user.nombre_completo,
        "fecha_ingreso": current_user.fecha_ingreso,
        "dias_vacaciones_anio": current_user.dias_vacaciones_anio,
        "dias_vacaciones_disponibles": current_user.dias_vacaciones_disponibles,
        "dias_vacaciones_tomados": current_user.dias_vacaciones_tomados,
        "dias_vacaciones_pendientes_anios_anteriores": current_user.dias_vacaciones_pendientes_anios_anteriores
    }


@router.post("/", response_model=SolicitudVacacionesResponse, status_code=status.HTTP_201_CREATED)
def crear_solicitud_vacaciones(
    solicitud: SolicitudVacacionesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Crear una nueva solicitud de vacaciones
    """
    # Validar que tenga días disponibles
    current_user.actualizar_dias_vacaciones()
    
    if solicitud.cantidad > current_user.dias_vacaciones_disponibles:
        raise HTTPException(
            status_code=400,
            detail=f"No tienes suficientes días disponibles. Disponibles: {current_user.dias_vacaciones_disponibles}"
        )
    
    # Validar que la fecha de inicio sea mayor a hoy
    if solicitud.fecha_inicio < date.today():
        raise HTTPException(
            status_code=400,
            detail="La fecha de inicio no puede ser anterior a hoy"
        )
    
    # Validar que la fecha de fin sea mayor a la de inicio
    if solicitud.fecha_fin < solicitud.fecha_inicio:
        raise HTTPException(
            status_code=400,
            detail="La fecha de fin debe ser posterior a la fecha de inicio"
        )
    
    # Crear solicitud
    db_solicitud = SolicitudVacaciones(
        empleado_id=current_user.id,
        **solicitud.dict()
    )
    
    db.add(db_solicitud)
    db.commit()
    db.refresh(db_solicitud)
    
    return db_solicitud


@router.get("/{solicitud_id}", response_model=SolicitudVacacionesResponse)
def get_solicitud_vacaciones(
    solicitud_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtener una solicitud de vacaciones por ID
    """
    solicitud = db.query(SolicitudVacaciones).filter(SolicitudVacaciones.id == solicitud_id).first()
    
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    # Solo el empleado o un ADMIN pueden ver la solicitud
    if current_user.rol.value != "ADMIN" and solicitud.empleado_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta solicitud")
    
    return solicitud


@router.put("/{solicitud_id}", response_model=SolicitudVacacionesResponse)
def actualizar_solicitud_vacaciones(
    solicitud_id: int,
    solicitud_update: SolicitudVacacionesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Actualizar una solicitud de vacaciones (solo si está pendiente)
    """
    solicitud = db.query(SolicitudVacaciones).filter(SolicitudVacaciones.id == solicitud_id).first()
    
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    # Solo el empleado puede actualizar su solicitud
    if solicitud.empleado_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para actualizar esta solicitud")
    
    # Solo se puede actualizar si está pendiente
    if solicitud.estado != EstadoSolicitudEnum.PENDIENTE:
        raise HTTPException(status_code=400, detail="Solo se pueden actualizar solicitudes pendientes")
    
    update_data = solicitud_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(solicitud, key, value)
    
    db.add(solicitud)
    db.commit()
    db.refresh(solicitud)
    
    return solicitud


@router.post("/{solicitud_id}/aprobar", response_model=SolicitudVacacionesResponse)
def aprobar_rechazar_solicitud(
    solicitud_id: int,
    aprobacion: SolicitudVacacionesAprobacion,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "JEFE_TALLER"]))
):
    """
    Aprobar o rechazar una solicitud de vacaciones (solo ADMIN o JEFE_TALLER)
    """
    solicitud = db.query(SolicitudVacaciones).filter(SolicitudVacaciones.id == solicitud_id).first()
    
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    # Solo se puede aprobar/rechazar si está pendiente
    if solicitud.estado != EstadoSolicitudEnum.PENDIENTE:
        raise HTTPException(status_code=400, detail="Esta solicitud ya fue procesada")
    
    if aprobacion.aprobar:
        # Aprobar
        solicitud.estado = EstadoSolicitudEnum.APROBADA
        solicitud.aprobada_por_id = current_user.id
        solicitud.fecha_aprobacion = datetime.now()
        
        # Descontar días del empleado
        empleado = solicitud.empleado
        empleado.dias_vacaciones_tomados += int(solicitud.cantidad)
        empleado.actualizar_dias_vacaciones()
        db.add(empleado)
    else:
        # Rechazar
        solicitud.estado = EstadoSolicitudEnum.RECHAZADA
        solicitud.motivo_rechazo = aprobacion.motivo_rechazo
        solicitud.aprobada_por_id = current_user.id
        solicitud.fecha_aprobacion = datetime.now()
    
    db.add(solicitud)
    db.commit()
    db.refresh(solicitud)
    
    return solicitud


@router.delete("/{solicitud_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_solicitud_vacaciones(
    solicitud_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Eliminar una solicitud de vacaciones (solo si está pendiente)
    """
    solicitud = db.query(SolicitudVacaciones).filter(SolicitudVacaciones.id == solicitud_id).first()
    
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    # Solo el empleado o un ADMIN pueden eliminar
    if current_user.rol.value != "ADMIN" and solicitud.empleado_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta solicitud")
    
    # Solo se puede eliminar si está pendiente o rechazada
    if solicitud.estado not in [EstadoSolicitudEnum.PENDIENTE, EstadoSolicitudEnum.RECHAZADA]:
        raise HTTPException(status_code=400, detail="No se puede eliminar una solicitud aprobada o tomada")
    
    db.delete(solicitud)
    db.commit()
    
    return None
