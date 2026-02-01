from sqlalchemy import Column, Integer, String, DateTime, Date, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class TipoIncidenciaEnum(str, enum.Enum):
    RETARDO = "RETARDO"
    FALTA_INJUSTIFICADA = "FALTA_INJUSTIFICADA"
    LLAMADA_ATENCION = "LLAMADA_ATENCION"
    SANCION = "SANCION"
    SUSPENSION = "SUSPENSION"
    RECONOCIMIENTO = "RECONOCIMIENTO"
    BONO = "BONO"
    AUMENTO = "AUMENTO"
    PROMOCION = "PROMOCION"
    CAPACITACION = "CAPACITACION"
    ACCIDENTE_TRABAJO = "ACCIDENTE_TRABAJO"
    OTRO = "OTRO"


class SeveridadEnum(str, enum.Enum):
    LEVE = "LEVE"
    MODERADA = "MODERADA"
    GRAVE = "GRAVE"
    MUY_GRAVE = "MUY_GRAVE"
    POSITIVA = "POSITIVA"


class IncidenciaEmpleado(Base):
    __tablename__ = "incidencias_empleado"

    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    
    # Información de la incidencia
    fecha_incidencia = Column(Date, nullable=False, index=True)
    tipo = Column(Enum(TipoIncidenciaEnum), nullable=False)
    severidad = Column(Enum(SeveridadEnum), nullable=False, default=SeveridadEnum.LEVE)
    
    # Descripción
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=False)
    consecuencias = Column(Text, nullable=True)  # Acciones tomadas o consecuencias
    
    # Documento adjunto
    documento_url = Column(String(255), nullable=True)
    
    # Registro
    registrado_por_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())
    
    # Seguimiento
    requiere_seguimiento = Column(Integer, default=0)  # Boolean como int
    fecha_seguimiento = Column(Date, nullable=True)
    seguimiento_completado = Column(Integer, default=0)  # Boolean como int
    notas_seguimiento = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    empleado = relationship("User", foreign_keys=[empleado_id], back_populates="incidencias", overlaps="registrado_por")
    registrado_por = relationship("User", foreign_keys=[registrado_por_id], overlaps="empleado,incidencias")

    def __repr__(self):
        return f"<IncidenciaEmpleado {self.tipo} - {self.empleado_id} - {self.fecha_incidencia}>"
