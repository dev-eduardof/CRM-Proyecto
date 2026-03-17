from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, date
from decimal import Decimal

TipoGasto = Literal["TRABAJO", "GENERAL"]
CategoriaGasto = Literal["COMPRAS", "MATERIALES", "OTRO"]


class GastoBase(BaseModel):
    descripcion: str = Field(..., min_length=1, max_length=255)
    monto: Decimal = Field(..., ge=0.01)
    tipo: TipoGasto
    categoria: Optional[CategoriaGasto] = None
    orden_trabajo_id: Optional[int] = None
    sub_orden_id: Optional[int] = None  # Si se envía, el gasto se asocia a esta sub-OT
    fecha_gasto: date

    class Config:
        from_attributes = True


class GastoCreate(GastoBase):
    pass


class GastoUpdate(BaseModel):
    descripcion: Optional[str] = Field(None, min_length=1, max_length=255)
    monto: Optional[Decimal] = Field(None, ge=0.01)
    tipo: Optional[TipoGasto] = None
    categoria: Optional[CategoriaGasto] = None
    orden_trabajo_id: Optional[int] = None
    sub_orden_id: Optional[int] = None
    fecha_gasto: Optional[date] = None


class GastoResponse(BaseModel):
    id: int
    orden_trabajo_id: Optional[int] = None
    sub_orden_id: Optional[int] = None
    descripcion: str
    monto: Decimal
    tipo: str
    categoria: Optional[str] = None
    usuario_registro_id: int
    fecha_gasto: date
    created_at: datetime

    # Campos expandidos (opcionales, se rellenan en API)
    folio_orden: Optional[str] = None
    nombre_registro: Optional[str] = None

    class Config:
        from_attributes = True
