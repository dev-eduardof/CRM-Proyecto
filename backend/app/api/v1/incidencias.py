from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.incidencia_empleado import IncidenciaEmpleado, TipoIncidenciaEnum, SeveridadEnum
from app.schemas.incidencia import (
    IncidenciaCreate,
    IncidenciaUpdate,
    IncidenciaResponse
)
from app.core.dependencies import get_current_active_user, require_role

router = APIRouter(
    prefix="/incidencias",
    tags=["Incidencias"]
)


@router.get("/", response_model=List[IncidenciaResponse])
def get_incidencias(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    empleado_id: Optional[int] = None,
    tipo: Optional[TipoIncidenciaEnum] = None,
    severidad: Optional[SeveridadEnum] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    requiere_seguimiento: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
):
    """
    Obtener incidencias.
    - Los empleados solo ven sus propias incidencias
    - Los ADMIN y JEFE_TALLER pueden ver todas las incidencias
    """
    query = db.query(IncidenciaEmpleado)
    
    # Control de acceso
    if current_user.rol.value not in ["ADMIN", "JEFE_TALLER"]:
        query = query.filter(IncidenciaEmpleado.empleado_id == current_user.id)
    elif empleado_id:
        query = query.filter(IncidenciaEmpleado.empleado_id == empleado_id)
    
    if tipo:
        query = query.filter(IncidenciaEmpleado.tipo == tipo)
    
    if severidad:
        query = query.filter(IncidenciaEmpleado.severidad == severidad)
    
    if fecha_desde:
        query = query.filter(IncidenciaEmpleado.fecha_incidencia >= fecha_desde)
    
    if fecha_hasta:
        query = query.filter(IncidenciaEmpleado.fecha_incidencia <= fecha_hasta)
    
    if requiere_seguimiento is not None:
        query = query.filter(IncidenciaEmpleado.requiere_seguimiento == (1 if requiere_seguimiento else 0))
    
    incidencias = query.order_by(IncidenciaEmpleado.fecha_incidencia.desc()).offset(skip).limit(limit).all()
    
    # Agregar nombres de empleado y registrador
    result = []
    for incidencia in incidencias:
        incidencia_dict = IncidenciaResponse.from_orm(incidencia).dict()
        incidencia_dict['empleado_nombre'] = incidencia.empleado.nombre_completo
        incidencia_dict['registrado_por_nombre'] = incidencia.registrado_por.nombre_completo
        # Convertir int a bool para la respuesta
        incidencia_dict['requiere_seguimiento'] = bool(incidencia.requiere_seguimiento)
        incidencia_dict['seguimiento_completado'] = bool(incidencia.seguimiento_completado)
        result.append(incidencia_dict)
    
    return result


@router.get("/mis-incidencias", response_model=List[IncidenciaResponse])
def get_mis_incidencias(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Obtener las incidencias del usuario actual
    """
    incidencias = db.query(IncidenciaEmpleado).filter(
        IncidenciaEmpleado.empleado_id == current_user.id
    ).order_by(IncidenciaEmpleado.fecha_incidencia.desc()).offset(skip).limit(limit).all()
    
    result = []
    for incidencia in incidencias:
        incidencia_dict = IncidenciaResponse.from_orm(incidencia).dict()
        incidencia_dict['empleado_nombre'] = incidencia.empleado.nombre_completo
        incidencia_dict['registrado_por_nombre'] = incidencia.registrado_por.nombre_completo
        incidencia_dict['requiere_seguimiento'] = bool(incidencia.requiere_seguimiento)
        incidencia_dict['seguimiento_completado'] = bool(incidencia.seguimiento_completado)
        result.append(incidencia_dict)
    
    return result


@router.post("/", response_model=IncidenciaResponse, status_code=status.HTTP_201_CREATED)
def crear_incidencia(
    incidencia: IncidenciaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "JEFE_TALLER"]))
):
    """
    Crear una nueva incidencia (solo ADMIN o JEFE_TALLER)
    """
    # Verificar que el empleado existe
    empleado = db.query(User).filter(User.id == incidencia.empleado_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    # Convertir bool a int para requiere_seguimiento
    incidencia_data = incidencia.dict()
    incidencia_data['requiere_seguimiento'] = 1 if incidencia_data['requiere_seguimiento'] else 0
    incidencia_data['registrado_por_id'] = current_user.id
    
    db_incidencia = IncidenciaEmpleado(**incidencia_data)
    
    db.add(db_incidencia)
    db.commit()
    db.refresh(db_incidencia)
    
    return db_incidencia


@router.get("/{incidencia_id}", response_model=IncidenciaResponse)
def get_incidencia(
    incidencia_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtener una incidencia por ID
    """
    incidencia = db.query(IncidenciaEmpleado).filter(IncidenciaEmpleado.id == incidencia_id).first()
    
    if not incidencia:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")
    
    # Control de acceso
    if current_user.rol.value not in ["ADMIN", "JEFE_TALLER"] and incidencia.empleado_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta incidencia")
    
    return incidencia


@router.put("/{incidencia_id}", response_model=IncidenciaResponse)
def actualizar_incidencia(
    incidencia_id: int,
    incidencia_update: IncidenciaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "JEFE_TALLER"]))
):
    """
    Actualizar una incidencia (solo ADMIN o JEFE_TALLER)
    """
    incidencia = db.query(IncidenciaEmpleado).filter(IncidenciaEmpleado.id == incidencia_id).first()
    
    if not incidencia:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")
    
    update_data = incidencia_update.dict(exclude_unset=True)
    
    # Convertir bool a int si es necesario
    if 'requiere_seguimiento' in update_data:
        update_data['requiere_seguimiento'] = 1 if update_data['requiere_seguimiento'] else 0
    if 'seguimiento_completado' in update_data:
        update_data['seguimiento_completado'] = 1 if update_data['seguimiento_completado'] else 0
    
    for key, value in update_data.items():
        setattr(incidencia, key, value)
    
    db.add(incidencia)
    db.commit()
    db.refresh(incidencia)
    
    return incidencia


@router.delete("/{incidencia_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_incidencia(
    incidencia_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """
    Eliminar una incidencia (solo ADMIN)
    """
    incidencia = db.query(IncidenciaEmpleado).filter(IncidenciaEmpleado.id == incidencia_id).first()
    
    if not incidencia:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")
    
    db.delete(incidencia)
    db.commit()
    
    return None


@router.get("/estadisticas/empleado/{empleado_id}", response_model=dict)
def get_estadisticas_incidencias_empleado(
    empleado_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "JEFE_TALLER"]))
):
    """
    Obtener estadísticas de incidencias de un empleado
    """
    empleado = db.query(User).filter(User.id == empleado_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    incidencias = db.query(IncidenciaEmpleado).filter(
        IncidenciaEmpleado.empleado_id == empleado_id
    ).all()
    
    # Contar por tipo
    por_tipo = {}
    por_severidad = {}
    
    for incidencia in incidencias:
        tipo = incidencia.tipo.value
        severidad = incidencia.severidad.value
        
        por_tipo[tipo] = por_tipo.get(tipo, 0) + 1
        por_severidad[severidad] = por_severidad.get(severidad, 0) + 1
    
    return {
        "empleado_id": empleado_id,
        "nombre_completo": empleado.nombre_completo,
        "total_incidencias": len(incidencias),
        "por_tipo": por_tipo,
        "por_severidad": por_severidad
    }
