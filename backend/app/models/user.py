from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Date, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import date, timedelta
from app.database import Base


class RolEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    TECNICO = "TECNICO"
    RECEPCION = "RECEPCION"
    CAJA = "CAJA"
    AUXILIAR = "AUXILIAR"
    JEFE_TALLER = "JEFE_TALLER"


class TipoContratoEnum(str, enum.Enum):
    PLANTA = "PLANTA"
    TEMPORAL = "TEMPORAL"
    POR_OBRA = "POR_OBRA"


class EstadoCivilEnum(str, enum.Enum):
    SOLTERO = "SOLTERO"
    CASADO = "CASADO"
    DIVORCIADO = "DIVORCIADO"
    VIUDO = "VIUDO"
    UNION_LIBRE = "UNION_LIBRE"


class User(Base):
    __tablename__ = "usuarios"

    # Campos básicos existentes
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    nombre_completo = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol = Column(Enum(RolEnum), nullable=False, default=RolEnum.RECEPCION)
    activo = Column(Boolean, default=True, nullable=False)
    codigo = Column(String(4), nullable=True, unique=True, index=True)  # Código 4 dígitos para login técnicos
    
    # Información Personal
    rfc = Column(String(13), nullable=True, index=True)
    curp = Column(String(18), nullable=True, index=True)
    nss = Column(String(11), nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    telefono = Column(String(15), nullable=True)
    telefono_emergencia = Column(String(15), nullable=True)
    contacto_emergencia = Column(String(100), nullable=True)
    estado_civil = Column(Enum(EstadoCivilEnum), nullable=True)
    
    # Dirección
    calle = Column(String(100), nullable=True)
    numero = Column(String(20), nullable=True)
    colonia = Column(String(100), nullable=True)
    codigo_postal = Column(String(5), nullable=True)
    ciudad = Column(String(100), nullable=True)
    estado = Column(String(50), nullable=True)
    
    # Información Laboral
    fecha_ingreso = Column(Date, nullable=True)
    fecha_baja = Column(Date, nullable=True)
    motivo_baja = Column(Text, nullable=True)
    tipo_contrato = Column(Enum(TipoContratoEnum), nullable=True, default=TipoContratoEnum.PLANTA)
    salario_base_diario = Column(Numeric(10, 2), nullable=True)
    horario_trabajo = Column(String(100), nullable=True)  # ej: "Lunes a Viernes 8:00-17:00"
    dias_descanso = Column(String(50), nullable=True)  # ej: "Sábado y Domingo"
    departamento = Column(String(100), nullable=True)
    puesto_especifico = Column(String(100), nullable=True)
    jefe_directo_id = Column(Integer, ForeignKey('usuarios.id'), nullable=True)
    
    # Vacaciones
    dias_vacaciones_anio = Column(Integer, default=12, nullable=False)
    dias_vacaciones_disponibles = Column(Integer, default=12, nullable=False)
    dias_vacaciones_tomados = Column(Integer, default=0, nullable=False)
    dias_vacaciones_pendientes_anios_anteriores = Column(Integer, default=0, nullable=False)
    
    # Foto
    foto_url = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    jefe_directo = relationship("User", remote_side=[id], backref="subordinados")
    solicitudes_vacaciones = relationship(
        "SolicitudVacaciones", 
        back_populates="empleado", 
        foreign_keys="SolicitudVacaciones.empleado_id",
        cascade="all, delete-orphan"
    )
    asistencias = relationship(
        "Asistencia", 
        back_populates="empleado",
        foreign_keys="Asistencia.empleado_id",
        cascade="all, delete-orphan"
    )
    documentos = relationship(
        "DocumentoEmpleado", 
        back_populates="empleado",
        foreign_keys="DocumentoEmpleado.empleado_id",
        cascade="all, delete-orphan"
    )
    incidencias = relationship(
        "IncidenciaEmpleado", 
        back_populates="empleado",
        foreign_keys="IncidenciaEmpleado.empleado_id",
        cascade="all, delete-orphan"
    )

    def calcular_dias_vacaciones_por_antiguedad(self):
        """Calcula los días de vacaciones según la Ley Federal del Trabajo de México"""
        if not self.fecha_ingreso:
            return 12
        
        hoy = date.today()
        antiguedad_dias = (hoy - self.fecha_ingreso).days
        antiguedad_anios = antiguedad_dias // 365
        
        if antiguedad_anios < 1:
            return 12
        elif antiguedad_anios == 1:
            return 14
        elif antiguedad_anios == 2:
            return 16
        elif antiguedad_anios == 3:
            return 18
        elif antiguedad_anios < 10:
            return 20
        elif antiguedad_anios < 15:
            return 22
        else:
            # +2 días cada 5 años después del año 15
            anios_adicionales = antiguedad_anios - 15
            periodos_5_anios = anios_adicionales // 5
            return 22 + (periodos_5_anios * 2)
    
    def actualizar_dias_vacaciones(self):
        """Actualiza los días de vacaciones según antigüedad"""
        self.dias_vacaciones_anio = self.calcular_dias_vacaciones_por_antiguedad()
        self.dias_vacaciones_disponibles = (
            self.dias_vacaciones_anio + 
            self.dias_vacaciones_pendientes_anios_anteriores - 
            self.dias_vacaciones_tomados
        )

    def __repr__(self):
        return f"<User {self.username} - {self.rol}>"
