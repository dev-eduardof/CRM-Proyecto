from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.models.orden_trabajo import TipoPermisoEnum


# Schemas para Categorías
class CategoriaOrdenBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)
    activo: bool = True


class CategoriaOrdenCreate(CategoriaOrdenBase):
    pass


class CategoriaOrdenResponse(CategoriaOrdenBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Schemas para Subcategorías
class SubcategoriaOrdenBase(BaseModel):
    categoria_id: int
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)
    activo: bool = True


class SubcategoriaOrdenCreate(SubcategoriaOrdenBase):
    pass


class SubcategoriaOrdenResponse(SubcategoriaOrdenBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Schemas para Subtareas
class SubtareaOrdenBase(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=200)
    descripcion: Optional[str] = None
    tecnico_asignado_id: Optional[int] = None
    estado: str = "PENDIENTE"
    orden: int = 0


class SubtareaOrdenCreate(SubtareaOrdenBase):
    orden_trabajo_id: int


class SubtareaOrdenUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1, max_length=200)
    descripcion: Optional[str] = None
    tecnico_asignado_id: Optional[int] = None
    estado: Optional[str] = None
    orden: Optional[int] = None
    fecha_inicio: Optional[datetime] = None
    fecha_completada: Optional[datetime] = None


class SubtareaOrdenResponse(SubtareaOrdenBase):
    id: int
    orden_trabajo_id: int
    fecha_inicio: Optional[datetime] = None
    fecha_completada: Optional[datetime] = None
    tecnico_nombre: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Schemas para Órdenes de Trabajo
class OrdenTrabajoBase(BaseModel):
    cliente_id: int = Field(..., description="ID del cliente")
    sucursal_id: Optional[int] = Field(None, description="ID de la sucursal del cliente")
    categoria_id: Optional[int] = Field(None, description="ID de la categoría")
    subcategoria_id: Optional[int] = Field(None, description="ID de la subcategoría")
    tecnico_asignado_id: Optional[int] = Field(None, description="ID del técnico asignado")
    
    # Información del trabajo
    descripcion: str = Field(..., min_length=10, description="Descripción del trabajo a realizar")
    observaciones: Optional[str] = Field(None, description="Observaciones adicionales")
    
    # Información de contacto para notificaciones
    nombre_contacto_notificacion: Optional[str] = Field(None, max_length=200, description="Nombre del contacto para notificaciones")
    telefono_contacto_notificacion: Optional[str] = Field(None, max_length=15, description="Teléfono del contacto para notificaciones")
    
    # Tipo de permiso/documento
    tipo_permiso: Optional[TipoPermisoEnum] = Field(None, description="Tipo de permiso o documento")
    numero_permiso: Optional[str] = Field(None, max_length=50, description="Número de OC, cotización, etc.")
    
    # Precios
    precio_estimado: Optional[Decimal] = Field(None, ge=0, description="Precio estimado/sugerido")
    anticipo: Decimal = Field(default=Decimal("0.00"), ge=0, description="Anticipo recibido")
    precio_final: Optional[Decimal] = Field(None, ge=0, description="Precio final acordado")
    
    # Estado y prioridad
    estatus: str = Field(default="RECIBIDO", description="Estado de la orden")
    prioridad: str = Field(default="NORMAL", description="Prioridad de la orden")
    
    # Fechas
    fecha_promesa: Optional[datetime] = Field(None, description="Fecha promesa de entrega")


class OrdenTrabajoCreate(OrdenTrabajoBase):
    pass


class OrdenTrabajoUpdate(BaseModel):
    sucursal_id: Optional[int] = None
    categoria_id: Optional[int] = None
    subcategoria_id: Optional[int] = None
    tecnico_asignado_id: Optional[int] = None
    descripcion: Optional[str] = Field(None, min_length=10)
    observaciones: Optional[str] = None
    nombre_contacto_notificacion: Optional[str] = Field(None, max_length=200)
    telefono_contacto_notificacion: Optional[str] = Field(None, max_length=15)
    tipo_permiso: Optional[str] = None
    numero_permiso: Optional[str] = Field(None, max_length=50)
    precio_estimado: Optional[Decimal] = Field(None, ge=0)
    anticipo: Optional[Decimal] = Field(None, ge=0)
    precio_final: Optional[Decimal] = Field(None, ge=0)
    estatus: Optional[str] = None
    prioridad: Optional[str] = None
    fecha_promesa: Optional[datetime] = None
    fecha_inicio_trabajo: Optional[datetime] = None
    fecha_terminado: Optional[datetime] = None
    fecha_entrega: Optional[datetime] = None
    foto_entrada: Optional[str] = None
    foto_salida: Optional[str] = None


class OrdenTrabajoResponse(OrdenTrabajoBase):
    id: int
    folio: str
    usuario_recepcion_id: int
    
    # Fotos
    foto_entrada: Optional[str] = None
    foto_salida: Optional[str] = None
    
    # Fechas
    fecha_recepcion: datetime
    fecha_inicio_trabajo: Optional[datetime] = None
    fecha_terminado: Optional[datetime] = None
    fecha_entrega: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Información adicional calculada
    cliente_nombre: Optional[str] = None
    sucursal_nombre: Optional[str] = None
    categoria_nombre: Optional[str] = None
    subcategoria_nombre: Optional[str] = None
    tecnico_nombre: Optional[str] = None
    usuario_recepcion_nombre: Optional[str] = None
    dias_desde_recepcion: Optional[int] = None
    esta_retrasada: Optional[bool] = None
    saldo_pendiente: Optional[Decimal] = None
    porcentaje_completado: Optional[int] = None
    
    # Subtareas
    subtareas: List[SubtareaOrdenResponse] = []

    class Config:
        from_attributes = True


class OrdenTrabajoListResponse(BaseModel):
    id: int
    folio: str
    cliente_id: int
    cliente_nombre: Optional[str] = None
    sucursal_id: Optional[int] = None
    sucursal_nombre: Optional[str] = None
    categoria_nombre: Optional[str] = None
    subcategoria_nombre: Optional[str] = None
    descripcion: str
    estatus: str
    prioridad: str
    fecha_recepcion: datetime
    fecha_promesa: Optional[datetime] = None
    tecnico_nombre: Optional[str] = None
    precio_final: Optional[Decimal] = None
    dias_desde_recepcion: Optional[int] = None
    esta_retrasada: Optional[bool] = None
    porcentaje_completado: Optional[int] = None

    class Config:
        from_attributes = True


class CambiarEstadoOrden(BaseModel):
    estatus: str = Field(..., description="Nuevo estado de la orden")
    observaciones: Optional[str] = Field(None, description="Observaciones del cambio de estado")


class UploadFotoRequest(BaseModel):
    tipo: str = Field(..., description="Tipo de foto: 'entrada' o 'salida'")
