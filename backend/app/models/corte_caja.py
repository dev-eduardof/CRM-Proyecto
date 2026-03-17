"""Corte de caja: diario (caja chica) y cierre final del día."""
from sqlalchemy import Column, Integer, Date, Numeric, DateTime, ForeignKey
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


class TipoCorteCajaEnum(str, enum.Enum):
    CAJA_CHICA = "CAJA_CHICA"   # Corte diario / parcial
    CIERRE_DIA = "CIERRE_DIA"   # Corte final del día


class CorteCaja(Base):
    __tablename__ = "cortes_caja"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False, index=True)
    tipo = Column(_EnumStringType(TipoCorteCajaEnum), nullable=False, index=True)
    saldo_inicial = Column(Numeric(12, 2), nullable=False, default=0)
    total_entradas = Column(Numeric(12, 2), nullable=False, default=0)
    total_salidas = Column(Numeric(12, 2), nullable=False, default=0)
    saldo_final = Column(Numeric(12, 2), nullable=False, default=0)
    cerrado_at = Column(DateTime(timezone=True), nullable=True)
    usuario_cierre_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    movimientos = relationship("MovimientoCaja", back_populates="corte", foreign_keys="MovimientoCaja.corte_id")
    usuario_cierre = relationship("User", foreign_keys=[usuario_cierre_id])

    def __repr__(self):
        return f"<CorteCaja {self.fecha} {self.tipo} saldo={self.saldo_final}>"
