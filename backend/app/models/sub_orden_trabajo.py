from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class SubOrdenTrabajo(Base):
    """Sub-trabajo dentro de una orden de trabajo. Puede tener materiales y gastos que se suman a la OT principal."""
    __tablename__ = "sub_ordenes_trabajo"

    id = Column(Integer, primary_key=True, index=True)
    orden_trabajo_id = Column(Integer, ForeignKey("ordenes_trabajo.id", ondelete="CASCADE"), nullable=False, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    orden = Column(Integer, default=0, nullable=False)  # Orden de visualización (1, 2, 3...)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    orden_trabajo = relationship("OrdenTrabajo", back_populates="sub_ordenes")
    piezas_usadas = relationship("OrdenTrabajoPieza", back_populates="sub_orden")
    gastos = relationship("Gasto", back_populates="sub_orden")

    def __repr__(self):
        return f"<SubOrdenTrabajo {self.titulo} OT={self.orden_trabajo_id}>"
