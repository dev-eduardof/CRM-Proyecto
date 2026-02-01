from sqlalchemy import Column, Integer, String, DateTime, Date, Enum, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class TipoDocumentoEnum(str, enum.Enum):
    INE = "INE"
    ACTA_NACIMIENTO = "ACTA_NACIMIENTO"
    CURP = "CURP"
    RFC = "RFC"
    COMPROBANTE_DOMICILIO = "COMPROBANTE_DOMICILIO"
    COMPROBANTE_ESTUDIOS = "COMPROBANTE_ESTUDIOS"
    CONTRATO = "CONTRATO"
    CARTA_RECOMENDACION = "CARTA_RECOMENDACION"
    CERTIFICADO_MEDICO = "CERTIFICADO_MEDICO"
    ANTECEDENTES_NO_PENALES = "ANTECEDENTES_NO_PENALES"
    NSS = "NSS"
    LICENCIA_CONDUCIR = "LICENCIA_CONDUCIR"
    OTRO = "OTRO"


class EstadoDocumentoEnum(str, enum.Enum):
    VIGENTE = "VIGENTE"
    POR_VENCER = "POR_VENCER"
    VENCIDO = "VENCIDO"
    NO_APLICA = "NO_APLICA"


class DocumentoEmpleado(Base):
    __tablename__ = "documentos_empleado"

    id = Column(Integer, primary_key=True, index=True)
    empleado_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    
    # Información del documento
    tipo_documento = Column(Enum(TipoDocumentoEnum), nullable=False)
    nombre_documento = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    
    # Archivo
    archivo_url = Column(String(255), nullable=False)
    
    # Vigencia
    fecha_emision = Column(Date, nullable=True)
    fecha_vencimiento = Column(Date, nullable=True)
    estado = Column(Enum(EstadoDocumentoEnum), nullable=False, default=EstadoDocumentoEnum.NO_APLICA)
    
    # Control
    verificado = Column(Boolean, default=False)
    verificado_por_id = Column(Integer, ForeignKey('usuarios.id'), nullable=True)
    fecha_verificacion = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    empleado = relationship("User", foreign_keys=[empleado_id], back_populates="documentos", overlaps="verificado_por")
    verificado_por = relationship("User", foreign_keys=[verificado_por_id], overlaps="empleado,documentos")

    def __repr__(self):
        return f"<DocumentoEmpleado {self.tipo_documento} - {self.empleado_id}>"
