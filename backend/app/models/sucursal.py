from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Sucursal(Base):
    __tablename__ = "sucursales"
    
    # Identificador
    id = Column(Integer, primary_key=True, index=True)
    
    # Relación con cliente (RFC)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False, index=True)
    
    # Información de la sucursal
    nombre_sucursal = Column(String(200), nullable=False, index=True)
    codigo_sucursal = Column(String(50), nullable=True)  # Código interno de la sucursal
    
    # Contacto específico de la sucursal
    telefono = Column(String(15), nullable=True)
    telefono_alternativo = Column(String(15), nullable=True)
    email = Column(String(100), nullable=True)
    
    # Dirección de la sucursal
    calle = Column(String(200), nullable=True)
    numero_exterior = Column(String(20), nullable=True)
    numero_interior = Column(String(20), nullable=True)
    colonia = Column(String(100), nullable=True)
    codigo_postal = Column(String(5), nullable=True)
    ciudad = Column(String(100), nullable=True)
    estado = Column(String(100), nullable=True)
    
    # Notas
    notas = Column(Text, nullable=True)
    
    # Estado
    activo = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    cliente = relationship("Cliente", back_populates="sucursales")
    ordenes_trabajo = relationship("OrdenTrabajo", back_populates="sucursal")
    
    def __repr__(self):
        return f"<Sucursal {self.nombre_sucursal} - Cliente ID: {self.cliente_id}>"
    
    @property
    def direccion_completa(self):
        """Retorna la dirección completa formateada"""
        partes = []
        
        if self.calle:
            calle_numero = self.calle
            if self.numero_exterior:
                calle_numero += f" #{self.numero_exterior}"
            if self.numero_interior:
                calle_numero += f" Int. {self.numero_interior}"
            partes.append(calle_numero)
        
        if self.colonia:
            partes.append(f"Col. {self.colonia}")
        
        if self.codigo_postal:
            partes.append(f"C.P. {self.codigo_postal}")
        
        if self.ciudad:
            partes.append(self.ciudad)
        
        if self.estado:
            partes.append(self.estado)
        
        return ", ".join(partes) if partes else "Sin dirección registrada"
