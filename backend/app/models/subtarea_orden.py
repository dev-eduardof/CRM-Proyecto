from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class EstadoSubtareaEnum(str, enum.Enum):
    PENDIENTE = "PENDIENTE"
    EN_PROCESO = "EN_PROCESO"
    COMPLETADA = "COMPLETADA"
    CANCELADA = "CANCELADA"


class SubtareaOrden(Base):
    __tablename__ = "subtareas_orden"
    
    id = Column(Integer, primary_key=True, index=True)
    orden_trabajo_id = Column(Integer, ForeignKey("ordenes_trabajo.id"), nullable=False, index=True)
    tecnico_asignado_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)
    
    # Información de la subtarea
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    orden = Column(Integer, default=0, nullable=False)  # Para ordenar las subtareas
    
    # Estado
    estado = Column(SQLEnum(EstadoSubtareaEnum), default=EstadoSubtareaEnum.PENDIENTE, nullable=False, index=True)
    
    # Fechas
    fecha_inicio = Column(DateTime(timezone=True), nullable=True)
    fecha_completada = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    orden_trabajo = relationship("OrdenTrabajo", back_populates="subtareas")
    tecnico = relationship("User", foreign_keys=[tecnico_asignado_id], backref="subtareas_asignadas")
    
    def __repr__(self):
        return f"<SubtareaOrden {self.titulo} - {self.estado}>"
