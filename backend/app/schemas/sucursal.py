from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# Schema base
class SucursalBase(BaseModel):
    cliente_id: int = Field(..., description="ID del cliente al que pertenece la sucursal")
    nombre_sucursal: str = Field(..., min_length=2, max_length=200)
    codigo_sucursal: Optional[str] = Field(None, max_length=50)
    telefono: Optional[str] = Field(None, max_length=15)
    telefono_alternativo: Optional[str] = Field(None, max_length=15)
    email: Optional[EmailStr] = None
    calle: Optional[str] = Field(None, max_length=200)
    numero_exterior: Optional[str] = Field(None, max_length=20)
    numero_interior: Optional[str] = Field(None, max_length=20)
    colonia: Optional[str] = Field(None, max_length=100)
    codigo_postal: Optional[str] = Field(None, max_length=5)
    ciudad: Optional[str] = Field(None, max_length=100)
    estado: Optional[str] = Field(None, max_length=100)
    notas: Optional[str] = None
    activo: bool = True


# Schema para crear sucursal
class SucursalCreate(SucursalBase):
    pass


# Schema para actualizar sucursal
class SucursalUpdate(BaseModel):
    nombre_sucursal: Optional[str] = Field(None, min_length=2, max_length=200)
    codigo_sucursal: Optional[str] = Field(None, max_length=50)
    telefono: Optional[str] = Field(None, max_length=15)
    telefono_alternativo: Optional[str] = Field(None, max_length=15)
    email: Optional[EmailStr] = None
    calle: Optional[str] = Field(None, max_length=200)
    numero_exterior: Optional[str] = Field(None, max_length=20)
    numero_interior: Optional[str] = Field(None, max_length=20)
    colonia: Optional[str] = Field(None, max_length=100)
    codigo_postal: Optional[str] = Field(None, max_length=5)
    ciudad: Optional[str] = Field(None, max_length=100)
    estado: Optional[str] = Field(None, max_length=100)
    notas: Optional[str] = None
    activo: Optional[bool] = None


# Schema para respuesta
class SucursalResponse(SucursalBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Campos calculados
    direccion_completa: Optional[str] = None
    
    # Información del cliente
    cliente_nombre: Optional[str] = None
    cliente_rfc: Optional[str] = None

    class Config:
        from_attributes = True
