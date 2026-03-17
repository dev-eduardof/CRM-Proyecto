from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Pieza(Base):
    """Pieza/refacción en bodega/almacén con precio y stock."""
    __tablename__ = "piezas"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, nullable=True, index=True)  # Folio auto (MAT-AÑO-XXXX) o manual
    catalogo_id = Column(Integer, ForeignKey("catalogos_pieza.id", ondelete="SET NULL"), nullable=True, index=True)
    subcatalogo_id = Column(Integer, ForeignKey("subcatalogos_pieza.id", ondelete="SET NULL"), nullable=True, index=True)
    nombre = Column(String(200), nullable=False, index=True)
    descripcion = Column(Text, nullable=True)
    precio = Column(Numeric(10, 2), nullable=False, default=0)
    stock = Column(Integer, nullable=False, default=0)
    unidad = Column(String(20), nullable=True, default="pza")  # pza, kg, m, etc.
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Catálogo / subcatálogo (mecánico)
    catalogo = relationship("CatalogoPieza", back_populates="piezas")
    subcatalogo = relationship("SubcatalogoPieza", back_populates="piezas")
    # Relación con usos en OT
    usos_orden = relationship("OrdenTrabajoPieza", back_populates="pieza", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Pieza {self.nombre} stock={self.stock}>"
