from sqlalchemy import Column, Integer, String, Numeric, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import TypeDecorator, VARCHAR
from app.database import Base
import enum


class _EnumStringType(TypeDecorator):
    """Acepta en BD valores en mayúsculas o minúsculas y los convierte al enum en Python."""
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


class TipoGastoEnum(str, enum.Enum):
    TRABAJO = "TRABAJO"   # Gasto asociado a una OT
    GENERAL = "GENERAL"  # Gasto general del negocio


class Gasto(Base):
    __tablename__ = "gastos"

    id = Column(Integer, primary_key=True, index=True)
    orden_trabajo_id = Column(Integer, ForeignKey("ordenes_trabajo.id", ondelete="SET NULL"), nullable=True, index=True)
    descripcion = Column(String(255), nullable=False)
    monto = Column(Numeric(10, 2), nullable=False)
    tipo = Column(_EnumStringType(TipoGastoEnum), nullable=False, index=True)
    usuario_registro_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    fecha_gasto = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relaciones
    orden_trabajo = relationship("OrdenTrabajo", backref="gastos")
    usuario_registro = relationship("User", foreign_keys=[usuario_registro_id], backref="gastos_registrados")

    def __repr__(self):
        return f"<Gasto {self.id} {self.descripcion[:30]} {self.monto}>"
