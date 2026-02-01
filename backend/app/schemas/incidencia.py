from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from app.models.incidencia_empleado import TipoIncidenciaEnum, SeveridadEnum


# Schema base
class IncidenciaBase(BaseModel):
    fecha_incidencia: date
    tipo: TipoIncidenciaEnum
    severidad: SeveridadEnum = SeveridadEnum.LEVE
    titulo: str = Field(..., min_length=3, max_length=200)
    descripcion: str = Field(..., min_length=10)
    consecuencias: Optional[str] = None
    requiere_seguimiento: bool = False
    fecha_seguimiento: Optional[date] = None


# Schema para crear incidencia
class IncidenciaCreate(IncidenciaBase):
    empleado_id: int


# Schema para actualizar incidencia
class IncidenciaUpdate(BaseModel):
    fecha_incidencia: Optional[date] = None
    tipo: Optional[TipoIncidenciaEnum] = None
    severidad: Optional[SeveridadEnum] = None
    titulo: Optional[str] = Field(None, min_length=3, max_length=200)
    descripcion: Optional[str] = Field(None, min_length=10)
    consecuencias: Optional[str] = None
    requiere_seguimiento: Optional[bool] = None
    fecha_seguimiento: Optional[date] = None
    seguimiento_completado: Optional[bool] = None
    notas_seguimiento: Optional[str] = None


# Schema para respuesta
class IncidenciaResponse(IncidenciaBase):
    id: int
    empleado_id: int
    documento_url: Optional[str] = None
    registrado_por_id: int
    fecha_registro: datetime
    seguimiento_completado: bool
    notas_seguimiento: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Información adicional (opcional, para listados)
    empleado_nombre: Optional[str] = None
    registrado_por_nombre: Optional[str] = None

    class Config:
        from_attributes = True
