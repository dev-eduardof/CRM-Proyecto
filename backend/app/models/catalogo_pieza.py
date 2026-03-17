"""Catálogo y subcatálogo para clasificar materiales/piezas del taller (mecánico)."""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class CatalogoPieza(Base):
    """Catálogo (categoría principal) para materiales del almacén."""
    __tablename__ = "catalogos_pieza"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, index=True)
    descripcion = Column(String(255), nullable=True)
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    subcatalogos = relationship("SubcatalogoPieza", back_populates="catalogo", cascade="all, delete-orphan")
    piezas = relationship("Pieza", back_populates="catalogo")

    def __repr__(self):
        return f"<CatalogoPieza {self.nombre}>"


class SubcatalogoPieza(Base):
    """Subcatálogo (subcategoría) dentro de un catálogo."""
    __tablename__ = "subcatalogos_pieza"

    id = Column(Integer, primary_key=True, index=True)
    catalogo_id = Column(Integer, ForeignKey("catalogos_pieza.id", ondelete="CASCADE"), nullable=False, index=True)
    nombre = Column(String(100), nullable=False, index=True)
    descripcion = Column(String(255), nullable=True)
    activo = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    catalogo = relationship("CatalogoPieza", back_populates="subcatalogos")
    piezas = relationship("Pieza", back_populates="subcatalogo")

    def __repr__(self):
        return f"<SubcatalogoPieza {self.nombre}>"
