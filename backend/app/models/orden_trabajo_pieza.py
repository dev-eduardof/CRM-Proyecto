from sqlalchemy import Column, Integer, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class OrdenTrabajoPieza(Base):
    """Uso de una pieza en una orden de trabajo (cantidad y precio unitario al momento del uso)."""
    __tablename__ = "orden_trabajo_piezas"

    id = Column(Integer, primary_key=True, index=True)
    orden_trabajo_id = Column(Integer, ForeignKey("ordenes_trabajo.id", ondelete="CASCADE"), nullable=False, index=True)
    sub_orden_id = Column(Integer, ForeignKey("sub_ordenes_trabajo.id", ondelete="SET NULL"), nullable=True, index=True)
    pieza_id = Column(Integer, ForeignKey("piezas.id", ondelete="RESTRICT"), nullable=False, index=True)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)  # Snapshot del precio al agregar a la OT

    # Relaciones
    orden_trabajo = relationship("OrdenTrabajo", back_populates="piezas_usadas")
    sub_orden = relationship("SubOrdenTrabajo", back_populates="piezas_usadas")
    pieza = relationship("Pieza", back_populates="usos_orden")

    def __repr__(self):
        return f"<OrdenTrabajoPieza OT={self.orden_trabajo_id} pieza={self.pieza_id} qty={self.cantidad}>"

    @property
    def subtotal(self):
        try:
            return float(self.precio_unitario or 0) * int(self.cantidad or 0)
        except (TypeError, ValueError):
            return 0.0
