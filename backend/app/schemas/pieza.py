from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class PiezaBase(BaseModel):
    codigo: Optional[str] = Field(None, max_length=50, description="Opcional; si no se envía se genera folio MAT-AÑO-XXXX")
    catalogo_id: Optional[int] = None
    subcatalogo_id: Optional[int] = None
    nombre: str = Field(..., min_length=1, max_length=200)
    descripcion: Optional[str] = None
    precio: Decimal = Field(..., ge=0, description="Precio unitario")
    stock: int = Field(default=0, ge=0, description="Cantidad en almacén")
    unidad: Optional[str] = Field("pza", max_length=20)
    activo: bool = True


class PiezaCreate(PiezaBase):
    pass


class PiezaUpdate(BaseModel):
    codigo: Optional[str] = Field(None, max_length=50)
    catalogo_id: Optional[int] = None
    subcatalogo_id: Optional[int] = None
    nombre: Optional[str] = Field(None, min_length=1, max_length=200)
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    unidad: Optional[str] = Field(None, max_length=20)
    activo: Optional[bool] = None


class PiezaResponse(PiezaBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    catalogo_nombre: Optional[str] = None
    subcatalogo_nombre: Optional[str] = None

    class Config:
        from_attributes = True


# Catálogo y subcatálogo (mecánico)
class CatalogoPiezaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)
    activo: bool = True


class CatalogoPiezaCreate(CatalogoPiezaBase):
    pass


class CatalogoPiezaUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)
    activo: Optional[bool] = None


class CatalogoPiezaResponse(CatalogoPiezaBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubcatalogoPiezaBase(BaseModel):
    catalogo_id: int
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)
    activo: bool = True


class SubcatalogoPiezaCreate(SubcatalogoPiezaBase):
    pass


class SubcatalogoPiezaUpdate(BaseModel):
    catalogo_id: Optional[int] = None
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=255)
    activo: Optional[bool] = None


class SubcatalogoPiezaResponse(SubcatalogoPiezaBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Uso de pieza en una OT
class OrdenTrabajoPiezaBase(BaseModel):
    pieza_id: int
    cantidad: int = Field(..., gt=0)
    precio_unitario: Optional[Decimal] = None  # Si no se envía, se usa el precio actual de la pieza
    sub_orden_id: Optional[int] = None  # Si se envía, la pieza se asocia a esta sub-OT


class OrdenTrabajoPiezaCreate(OrdenTrabajoPiezaBase):
    pass


class OrdenTrabajoPiezaUpdate(BaseModel):
    cantidad: Optional[int] = Field(None, gt=0)
    precio_unitario: Optional[Decimal] = Field(None, ge=0)


class OrdenTrabajoPiezaResponse(BaseModel):
    id: int
    orden_trabajo_id: int
    sub_orden_id: Optional[int] = None
    pieza_id: int
    pieza_nombre: Optional[str] = None
    pieza_codigo: Optional[str] = None
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True
