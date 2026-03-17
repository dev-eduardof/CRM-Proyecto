"""Movimientos de caja: entradas (pagos) y salidas (gastos caja chica)."""
from sqlalchemy import Column, Integer, String, Numeric, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import TypeDecorator, VARCHAR
from app.database import Base
import enum


class _EnumStringType(TypeDecorator):
    impl = VARCHAR(20)
    cache_ok = True

    def __init__(self, enum_class, *args, **kwargs):
        self.enum_class = enum_class
        super().__init__(*args, **kwargs)

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if hasattr(value, "value"):
            value = value.value
        return str(value).lower()

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if hasattr(value, "value"):
            return value
        s = str(value).strip().upper()
        try:
            return self.enum_class(s)
        except ValueError:
            for m in self.enum_class:
                if m.value.upper() == s:
                    return m
            return None


class TipoMovimientoCajaEnum(str, enum.Enum):
    ENTRADA = "ENTRADA"   # Pago por entrega OT, etc.
    SALIDA = "SALIDA"     # Caja chica, gasto menor


class MovimientoCaja(Base):
    __tablename__ = "movimientos_caja"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False, index=True)
    tipo = Column(_EnumStringType(TipoMovimientoCajaEnum), nullable=False, index=True)
    concepto = Column(String(255), nullable=False)
    monto = Column(Numeric(12, 2), nullable=False)
    orden_trabajo_id = Column(Integer, ForeignKey("ordenes_trabajo.id", ondelete="SET NULL"), nullable=True, index=True)
    corte_id = Column(Integer, ForeignKey("cortes_caja.id", ondelete="SET NULL"), nullable=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    orden_trabajo = relationship("OrdenTrabajo", backref="movimientos_caja")
    corte = relationship("CorteCaja", back_populates="movimientos")
    usuario = relationship("User", foreign_keys=[usuario_id])

    def __repr__(self):
        return f"<MovimientoCaja {self.tipo} {self.monto} {self.concepto[:30]}>"
