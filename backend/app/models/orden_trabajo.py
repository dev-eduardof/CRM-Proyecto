from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Numeric, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class EstadoOrdenEnum(str, enum.Enum):
    RECIBIDO = "RECIBIDO"
    DIAGNOSTICO = "DIAGNOSTICO"
    EN_ESPERA = "EN_ESPERA"
    PROCESO = "PROCESO"
    PAUSA = "PAUSA"
    REVISION = "REVISION"
    TERMINADO = "TERMINADO"
    ENTREGADO = "ENTREGADO"
    FINALIZADO = "FINALIZADO"


class PrioridadEnum(str, enum.Enum):
    NORMAL = "NORMAL"
    URGENTE = "URGENTE"


class TipoPermisoEnum(str, enum.Enum):
    COTIZACION = "COTIZACION"
    ORDEN_COMPRA = "ORDEN_COMPRA"
    REQUISICION = "REQUISICION"
    SERVICIO_DIRECTO = "SERVICIO_DIRECTO"


class OrdenTrabajo(Base):
    __tablename__ = "ordenes_trabajo"
    
    # Identificador
    id = Column(Integer, primary_key=True, index=True)
    folio = Column(String(20), unique=True, nullable=False, index=True)  # Ej: OT-2026-0001
    
    # Relaciones
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False, index=True)
    categoria_id = Column(Integer, ForeignKey("categorias_orden.id"), nullable=True, index=True)
    subcategoria_id = Column(Integer, ForeignKey("subcategorias_orden.id"), nullable=True, index=True)
    usuario_recepcion_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    tecnico_asignado_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)
    
    # Información de la pieza/trabajo
    descripcion = Column(Text, nullable=False)  # Descripción del trabajo a realizar
    observaciones = Column(Text, nullable=True)  # Observaciones adicionales
    foto_entrada = Column(String(255), nullable=True)  # Ruta de la foto de la pieza
    foto_salida = Column(String(255), nullable=True)  # Ruta de la foto del trabajo terminado
    
    # Tipo de permiso/documento
    tipo_permiso = Column(SQLEnum(TipoPermisoEnum), nullable=True)
    numero_permiso = Column(String(50), nullable=True)  # Número de OC, cotización, etc.
    
    # Precios
    precio_estimado = Column(Numeric(10, 2), nullable=True)  # Precio sugerido/estimado
    anticipo = Column(Numeric(10, 2), default=0.00, nullable=False)  # Anticipo recibido
    precio_final = Column(Numeric(10, 2), nullable=True)  # Precio final acordado
    
    # Estado y prioridad
    estatus = Column(SQLEnum(EstadoOrdenEnum), default=EstadoOrdenEnum.RECIBIDO, nullable=False, index=True)
    prioridad = Column(SQLEnum(PrioridadEnum), default=PrioridadEnum.NORMAL, nullable=False, index=True)
    
    # Fechas
    fecha_recepcion = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    fecha_promesa = Column(DateTime(timezone=True), nullable=True, index=True)  # Fecha promesa de entrega
    fecha_inicio_trabajo = Column(DateTime(timezone=True), nullable=True)
    fecha_terminado = Column(DateTime(timezone=True), nullable=True)
    fecha_entrega = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    cliente = relationship("Cliente", backref="ordenes_trabajo")
    categoria = relationship("CategoriaOrden", backref="ordenes")
    subcategoria = relationship("SubcategoriaOrden", backref="ordenes")
    usuario_recepcion = relationship("User", foreign_keys=[usuario_recepcion_id], backref="ordenes_recepcionadas")
    tecnico = relationship("User", foreign_keys=[tecnico_asignado_id], backref="ordenes_asignadas")
    subtareas = relationship("SubtareaOrden", back_populates="orden_trabajo", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<OrdenTrabajo {self.folio} - {self.estatus}>"
    
    @property
    def dias_desde_recepcion(self):
        """Calcula los días desde la recepción"""
        from datetime import datetime, timezone
        if self.fecha_entrega:
            return (self.fecha_entrega - self.fecha_recepcion).days
        return (datetime.now(timezone.utc) - self.fecha_recepcion).days
    
    @property
    def esta_retrasada(self):
        """Verifica si la orden está retrasada respecto a la fecha promesa"""
        from datetime import datetime, timezone
        if self.fecha_promesa and self.estatus not in [EstadoOrdenEnum.ENTREGADO, EstadoOrdenEnum.FINALIZADO]:
            return datetime.now(timezone.utc) > self.fecha_promesa
        return False
    
    @property
    def saldo_pendiente(self):
        """Calcula el saldo pendiente"""
        if self.precio_final:
            return float(self.precio_final - self.anticipo)
        return 0.0
    
    @property
    def porcentaje_completado(self):
        """Calcula el porcentaje de completado basado en subtareas"""
        if not self.subtareas:
            return 0
        completadas = sum(1 for st in self.subtareas if st.estado == "COMPLETADA")
        return int((completadas / len(self.subtareas)) * 100)
