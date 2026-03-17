"""Schemas para movimientos de caja y cortes."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

TipoMovimientoCaja = str  # "ENTRADA" | "SALIDA"
TipoCorteCaja = str  # "CAJA_CHICA" | "CIERRE_DIA"


class MovimientoCajaBase(BaseModel):
    fecha: date
    tipo: TipoMovimientoCaja
    concepto: str = Field(..., min_length=1, max_length=255)
    monto: Decimal = Field(..., gt=0)
    orden_trabajo_id: Optional[int] = None

    class Config:
        from_attributes = True


class MovimientoCajaCreate(MovimientoCajaBase):
    pass


class MovimientoCajaResponse(BaseModel):
    id: int
    fecha: date
    tipo: str
    concepto: str
    monto: Decimal
    orden_trabajo_id: Optional[int] = None
    corte_id: Optional[int] = None
    usuario_id: int
    created_at: datetime
    folio_orden: Optional[str] = None
    usuario_nombre: Optional[str] = None

    class Config:
        from_attributes = True


class CorteCajaBase(BaseModel):
    fecha: date
    tipo: TipoCorteCaja
    saldo_inicial: Decimal = Field(default=Decimal("0"), ge=0)
    total_entradas: Decimal = Field(default=Decimal("0"), ge=0)
    total_salidas: Decimal = Field(default=Decimal("0"), ge=0)
    saldo_final: Decimal = Field(default=Decimal("0"), ge=0)

    class Config:
        from_attributes = True


class CorteCajaCreate(BaseModel):
    fecha: date
    tipo: TipoCorteCaja = "CIERRE_DIA"
    saldo_inicial: Optional[Decimal] = None  # Si no se envía, se calcula del último corte


class CorteCajaResponse(BaseModel):
    id: int
    fecha: date
    tipo: str
    saldo_inicial: Decimal
    total_entradas: Decimal
    total_salidas: Decimal
    saldo_final: Decimal
    cerrado_at: Optional[datetime] = None
    usuario_cierre_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AperturaCajaCreate(BaseModel):
    fecha: date
    monto: Decimal = Field(..., ge=0)


class AnalisisOrdenResponse(BaseModel):
    orden_id: int
    folio: str
    cliente_nombre: Optional[str] = None
    total_gastos: Decimal
    total_ingresos_caja: Decimal
    diferencia: Decimal  # ingresos - gastos
    gastos: list
    ingresos: list
