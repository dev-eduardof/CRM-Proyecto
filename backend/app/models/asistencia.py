from sqlalchemy import Column, Integer, String, DateTime, Date, Time, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class TipoAsistenciaEnum(str, enum.Enum):
    NORMAL = "NORMAL"
    RETARDO = "RETARDO"
    FALTA = "FALTA"
    FALTA_JUSTIFICADA = "FALTA_JUSTIFICADA"
    PERMISO = "PERMISO"
    INCAPACIDAD = "INCAPACIDAD"
    VACACIONES = "VACACIONES"
    DIA_FESTIVO = "DIA_FESTIVO"


class Asistencia(Base):
    __tablename__ = "asistencias"

    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    
    # Fecha y horas
    fecha = Column(Date, nullable=False, index=True)
    hora_entrada = Column(Time, nullable=True)
    hora_salida = Column(Time, nullable=True)
    
    # Tipo de asistencia
    tipo = Column(Enum(TipoAsistenciaEnum), nullable=False, default=TipoAsistenciaEnum.NORMAL)
    
    # Observaciones
    observaciones = Column(Text, nullable=True)
    justificacion = Column(Text, nullable=True)
    documento_url = Column(String(255), nullable=True)  # Para incapacidades, permisos, etc.
    
    # Registro
    registrado_por_id = Column(Integer, ForeignKey('usuarios.id'), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    empleado = relationship("User", foreign_keys=[empleado_id], back_populates="asistencias", overlaps="registrado_por")
    registrado_por = relationship("User", foreign_keys=[registrado_por_id], overlaps="empleado,asistencias")

    def __repr__(self):
        return f"<Asistencia {self.empleado_id} - {self.fecha} - {self.tipo}>"
