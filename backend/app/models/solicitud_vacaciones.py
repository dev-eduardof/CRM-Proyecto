from sqlalchemy import Column, Integer, String, DateTime, Date, Enum, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class TipoSolicitudEnum(str, enum.Enum):
    DIAS_COMPLETOS = "DIAS_COMPLETOS"
    MEDIO_DIA = "MEDIO_DIA"
    HORAS = "HORAS"


class EstadoSolicitudEnum(str, enum.Enum):
    PENDIENTE = "PENDIENTE"
    APROBADA = "APROBADA"
    RECHAZADA = "RECHAZADA"
    TOMADA = "TOMADA"
    CANCELADA = "CANCELADA"


class SolicitudVacaciones(Base):
    __tablename__ = "solicitudes_vacaciones"

    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    
    # Fechas de la solicitud
    fecha_solicitud = Column(DateTime(timezone=True), server_default=func.now())
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    
    # Tipo y cantidad
    tipo = Column(Enum(TipoSolicitudEnum), nullable=False, default=TipoSolicitudEnum.DIAS_COMPLETOS)
    cantidad = Column(Numeric(5, 2), nullable=False)  # Días u horas
    
    # Estado y aprobación
    estado = Column(Enum(EstadoSolicitudEnum), nullable=False, default=EstadoSolicitudEnum.PENDIENTE)
    aprobada_por_id = Column(Integer, ForeignKey('usuarios.id'), nullable=True)
    fecha_aprobacion = Column(DateTime(timezone=True), nullable=True)
    
    # Observaciones y documentos
    observaciones = Column(Text, nullable=True)
    motivo_rechazo = Column(Text, nullable=True)
    pdf_url = Column(String(255), nullable=True)  # Ruta del PDF generado
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    empleado = relationship("User", foreign_keys=[empleado_id], back_populates="solicitudes_vacaciones", overlaps="aprobada_por")
    aprobada_por = relationship("User", foreign_keys=[aprobada_por_id], overlaps="empleado,solicitudes_vacaciones")

    def __repr__(self):
        return f"<SolicitudVacaciones {self.id} - {self.empleado_id} - {self.estado}>"
