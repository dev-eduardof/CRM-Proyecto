from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class TipoClienteEnum(str, enum.Enum):
    PERSONA_FISICA = "PERSONA_FISICA"
    PERSONA_MORAL = "PERSONA_MORAL"


class Cliente(Base):
    __tablename__ = "clientes"
    
    # Identificador
    id = Column(Integer, primary_key=True, index=True)
    
    # Información básica
    tipo_cliente = Column(SQLEnum(TipoClienteEnum), default=TipoClienteEnum.PERSONA_FISICA, nullable=False)
    nombre = Column(String(100), nullable=False, index=True)
    apellido_paterno = Column(String(100), nullable=True)
    apellido_materno = Column(String(100), nullable=True)
    razon_social = Column(String(200), nullable=True)  # Para persona moral
    rfc = Column(String(13), nullable=True, unique=True, index=True)
    
    # Contacto
    email = Column(String(100), nullable=True, index=True)
    telefono = Column(String(15), nullable=False)
    telefono_alternativo = Column(String(15), nullable=True)
    
    # Dirección
    calle = Column(String(200), nullable=True)
    numero_exterior = Column(String(20), nullable=True)
    numero_interior = Column(String(20), nullable=True)
    colonia = Column(String(100), nullable=True)
    codigo_postal = Column(String(5), nullable=True)
    ciudad = Column(String(100), nullable=True)
    estado = Column(String(100), nullable=True)
    
    # Información adicional
    fecha_nacimiento = Column(Date, nullable=True)
    notas = Column(Text, nullable=True)
    preferencias = Column(Text, nullable=True)  # Preferencias de servicio, horarios, etc.
    
    # Estado
    activo = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones (para futuro)
    # vehiculos = relationship("Vehiculo", back_populates="cliente")
    # ordenes = relationship("OrdenServicio", back_populates="cliente")
    
    def __repr__(self):
        if self.tipo_cliente == TipoClienteEnum.PERSONA_MORAL:
            return f"<Cliente {self.razon_social}>"
        return f"<Cliente {self.nombre} {self.apellido_paterno or ''}>"
    
    @property
    def nombre_completo(self):
        """Retorna el nombre completo del cliente"""
        if self.tipo_cliente == TipoClienteEnum.PERSONA_MORAL:
            return self.razon_social
        
        nombre_parts = [self.nombre]
        if self.apellido_paterno:
            nombre_parts.append(self.apellido_paterno)
        if self.apellido_materno:
            nombre_parts.append(self.apellido_materno)
        return " ".join(nombre_parts)
    
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
