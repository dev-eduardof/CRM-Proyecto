from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date
from app.models.cliente import TipoClienteEnum


# Schema base
class ClienteBase(BaseModel):
    tipo_cliente: TipoClienteEnum = TipoClienteEnum.PERSONA_FISICA
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido_paterno: Optional[str] = Field(None, max_length=100)
    apellido_materno: Optional[str] = Field(None, max_length=100)
    razon_social: Optional[str] = Field(None, max_length=200)
    rfc: Optional[str] = Field(None, max_length=13)
    email: Optional[EmailStr] = None
    telefono: str = Field(..., min_length=10, max_length=15)
    telefono_alternativo: Optional[str] = Field(None, max_length=15)
    calle: Optional[str] = Field(None, max_length=200)
    numero_exterior: Optional[str] = Field(None, max_length=20)
    numero_interior: Optional[str] = Field(None, max_length=20)
    colonia: Optional[str] = Field(None, max_length=100)
    codigo_postal: Optional[str] = Field(None, max_length=5)
    ciudad: Optional[str] = Field(None, max_length=100)
    estado: Optional[str] = Field(None, max_length=100)
    fecha_nacimiento: Optional[date] = None
    notas: Optional[str] = None
    preferencias: Optional[str] = None
    activo: bool = True


# Schema para crear cliente
class ClienteCreate(ClienteBase):
    pass


# Schema para actualizar cliente
class ClienteUpdate(BaseModel):
    tipo_cliente: Optional[TipoClienteEnum] = None
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    apellido_paterno: Optional[str] = Field(None, max_length=100)
    apellido_materno: Optional[str] = Field(None, max_length=100)
    razon_social: Optional[str] = Field(None, max_length=200)
    rfc: Optional[str] = Field(None, max_length=13)
    email: Optional[EmailStr] = None
    telefono: Optional[str] = Field(None, min_length=10, max_length=15)
    telefono_alternativo: Optional[str] = Field(None, max_length=15)
    calle: Optional[str] = Field(None, max_length=200)
    numero_exterior: Optional[str] = Field(None, max_length=20)
    numero_interior: Optional[str] = Field(None, max_length=20)
    colonia: Optional[str] = Field(None, max_length=100)
    codigo_postal: Optional[str] = Field(None, max_length=5)
    ciudad: Optional[str] = Field(None, max_length=100)
    estado: Optional[str] = Field(None, max_length=100)
    fecha_nacimiento: Optional[date] = None
    notas: Optional[str] = None
    preferencias: Optional[str] = None
    activo: Optional[bool] = None


# Schema para respuesta
class ClienteResponse(ClienteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Campos calculados
    nombre_completo: Optional[str] = None
    direccion_completa: Optional[str] = None

    class Config:
        from_attributes = True
