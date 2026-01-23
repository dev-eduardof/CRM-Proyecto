from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import RolEnum


# Schema base
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    nombre_completo: str = Field(..., min_length=3, max_length=100)
    rol: RolEnum = RolEnum.RECEPCION


# Schema para crear usuario
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


# Schema para actualizar usuario
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nombre_completo: Optional[str] = Field(None, min_length=3, max_length=100)
    rol: Optional[RolEnum] = None
    activo: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)


# Schema para respuesta
class UserResponse(UserBase):
    id: int
    activo: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

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
