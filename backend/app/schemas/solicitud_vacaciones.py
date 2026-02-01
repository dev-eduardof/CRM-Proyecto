from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from decimal import Decimal
from app.models.solicitud_vacaciones import TipoSolicitudEnum, EstadoSolicitudEnum


# Schema base
class SolicitudVacacionesBase(BaseModel):
    fecha_inicio: date
    fecha_fin: date
    tipo: TipoSolicitudEnum = TipoSolicitudEnum.DIAS_COMPLETOS
    cantidad: Decimal = Field(..., gt=0)
    observaciones: Optional[str] = None


# Schema para crear solicitud
class SolicitudVacacionesCreate(SolicitudVacacionesBase):
    pass


# Schema para actualizar solicitud
class SolicitudVacacionesUpdate(BaseModel):
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    tipo: Optional[TipoSolicitudEnum] = None
    cantidad: Optional[Decimal] = None
    observaciones: Optional[str] = None
    estado: Optional[EstadoSolicitudEnum] = None
    motivo_rechazo: Optional[str] = None


# Schema para aprobar/rechazar
class SolicitudVacacionesAprobacion(BaseModel):
    aprobar: bool
    motivo_rechazo: Optional[str] = None


# Schema para respuesta
class SolicitudVacacionesResponse(SolicitudVacacionesBase):
    id: int
    empleado_id: int
    fecha_solicitud: datetime
    estado: EstadoSolicitudEnum
    aprobada_por_id: Optional[int] = None
    fecha_aprobacion: Optional[datetime] = None
    motivo_rechazo: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Información del empleado (opcional, para listados)
    empleado_nombre: Optional[str] = None
    aprobada_por_nombre: Optional[str] = None

    class Config:
        from_attributes = True
