from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date
from decimal import Decimal
from app.models.user import RolEnum, TipoContratoEnum, EstadoCivilEnum


# Schema base
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    nombre_completo: str = Field(..., min_length=3, max_length=100)
    rol: RolEnum = RolEnum.RECEPCION


# Schema para crear usuario (campos mínimos requeridos)
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)
    
    # Información Personal (opcional en creación)
    rfc: Optional[str] = None
    curp: Optional[str] = None
    nss: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    telefono: Optional[str] = None
    telefono_emergencia: Optional[str] = None
    contacto_emergencia: Optional[str] = None
    estado_civil: Optional[EstadoCivilEnum] = None
    
    # Dirección
    calle: Optional[str] = None
    numero: Optional[str] = None
    colonia: Optional[str] = None
    codigo_postal: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    
    # Información Laboral
    fecha_ingreso: Optional[date] = None
    tipo_contrato: Optional[TipoContratoEnum] = TipoContratoEnum.PLANTA
    salario_base_diario: Optional[Decimal] = None
    horario_trabajo: Optional[str] = None
    dias_descanso: Optional[str] = None
    departamento: Optional[str] = None
    puesto_especifico: Optional[str] = None
    jefe_directo_id: Optional[int] = None


# Schema para actualizar usuario
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nombre_completo: Optional[str] = Field(None, min_length=3, max_length=100)
    rol: Optional[RolEnum] = None
    activo: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)
    
    # Información Personal
    rfc: Optional[str] = None
    curp: Optional[str] = None
    nss: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    telefono: Optional[str] = None
    telefono_emergencia: Optional[str] = None
    contacto_emergencia: Optional[str] = None
    estado_civil: Optional[EstadoCivilEnum] = None
    
    # Dirección
    calle: Optional[str] = None
    numero: Optional[str] = None
    colonia: Optional[str] = None
    codigo_postal: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    
    # Información Laboral
    fecha_ingreso: Optional[date] = None
    fecha_baja: Optional[date] = None
    motivo_baja: Optional[str] = None
    tipo_contrato: Optional[TipoContratoEnum] = None
    salario_base_diario: Optional[Decimal] = None
    horario_trabajo: Optional[str] = None
    dias_descanso: Optional[str] = None
    departamento: Optional[str] = None
    puesto_especifico: Optional[str] = None
    jefe_directo_id: Optional[int] = None
    
    # Vacaciones (solo admin puede modificar directamente)
    dias_vacaciones_pendientes_anios_anteriores: Optional[int] = None


# Schema para respuesta completa
class UserResponse(BaseModel):
    # Campos básicos
    id: int
    username: str
    email: str
    nombre_completo: str
    rol: RolEnum
    activo: bool
    
    # Información Personal
    rfc: Optional[str] = None
    curp: Optional[str] = None
    nss: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    telefono: Optional[str] = None
    telefono_emergencia: Optional[str] = None
    contacto_emergencia: Optional[str] = None
    estado_civil: Optional[EstadoCivilEnum] = None
    
    # Dirección
    calle: Optional[str] = None
    numero: Optional[str] = None
    colonia: Optional[str] = None
    codigo_postal: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    
    # Información Laboral
    fecha_ingreso: Optional[date] = None
    fecha_baja: Optional[date] = None
    motivo_baja: Optional[str] = None
    tipo_contrato: Optional[TipoContratoEnum] = None
    salario_base_diario: Optional[Decimal] = None
    horario_trabajo: Optional[str] = None
    dias_descanso: Optional[str] = None
    departamento: Optional[str] = None
    puesto_especifico: Optional[str] = None
    jefe_directo_id: Optional[int] = None
    
    # Vacaciones
    dias_vacaciones_anio: int
    dias_vacaciones_disponibles: int
    dias_vacaciones_tomados: int
    dias_vacaciones_pendientes_anios_anteriores: int
    
    # Foto
    foto_url: Optional[str] = None
    
    # Timestamps
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Schema simplificado para listados
class UserListResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    nombre_completo: str
    rol: RolEnum
    activo: bool
    departamento: Optional[str] = None
    puesto_especifico: Optional[str] = None
    fecha_ingreso: Optional[date] = None
    
    class Config:
        from_attributes = True


# Schema para login
class UserLogin(BaseModel):
    username: str
    password: str


# Schema para token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Schema para datos del token
class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    rol: Optional[str] = None
