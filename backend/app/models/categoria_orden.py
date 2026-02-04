from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class CategoriaOrden(Base):
    __tablename__ = "categorias_orden"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True, index=True)
    descripcion = Column(String(255), nullable=True)
    activo = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    subcategorias = relationship("SubcategoriaOrden", back_populates="categoria", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<CategoriaOrden {self.nombre}>"


class SubcategoriaOrden(Base):
    __tablename__ = "subcategorias_orden"
    
    id = Column(Integer, primary_key=True, index=True)
    categoria_id = Column(Integer, ForeignKey("categorias_orden.id"), nullable=False, index=True)
    nombre = Column(String(100), nullable=False, index=True)
    descripcion = Column(String(255), nullable=True)
    activo = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    categoria = relationship("CategoriaOrden", back_populates="subcategorias")
    
    def __repr__(self):
        return f"<SubcategoriaOrden {self.nombre}>"
