"""Apertura de caja: monto con el que se abre caja el día (caja chica / fondo inicial)."""
from sqlalchemy import Column, Integer, Date, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class AperturaCaja(Base):
    __tablename__ = "aperturas_caja"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False, unique=True, index=True)  # una apertura por día
    monto = Column(Numeric(12, 2), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    usuario = relationship("User", foreign_keys=[usuario_id])

    def __repr__(self):
        return f"<AperturaCaja {self.fecha} {self.monto}>"
