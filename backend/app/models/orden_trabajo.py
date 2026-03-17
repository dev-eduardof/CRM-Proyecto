from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Numeric, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import TypeDecorator, VARCHAR
from app.database import Base
import enum


class _EnumStringType(TypeDecorator):
    """Acepta en BD valores en mayúsculas o minúsculas y los convierte al enum en Python."""
    impl = VARCHAR(20)
    cache_ok = True

    def __init__(self, enum_class, *args, **kwargs):
        self.enum_class = enum_class
        super().__init__(*args, **kwargs)

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if hasattr(value, "value"):
            value = value.value
        # La BD (init.sql) tiene el ENUM en minúsculas; escribimos en minúsculas
        return str(value).lower()

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if hasattr(value, "value"):
            return value
        s = str(value).strip().upper()
        try:
            return self.enum_class(s)
        except ValueError:
            for m in self.enum_class:
                if m.value.upper() == s:
                    return m
            return None


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
    sucursal_id = Column(Integer, ForeignKey("sucursales.id"), nullable=True, index=True)
    categoria_id = Column(Integer, ForeignKey("categorias_orden.id"), nullable=True, index=True)
    subcategoria_id = Column(Integer, ForeignKey("subcategorias_orden.id"), nullable=True, index=True)
    usuario_recepcion_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    tecnico_asignado_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)
    
    # Información de la pieza/trabajo
    descripcion = Column(Text, nullable=False)  # Descripción del trabajo a realizar
    observaciones = Column(Text, nullable=True)  # Observaciones adicionales
    foto_entrada = Column(String(255), nullable=True)  # Primera foto de entrada (compatibilidad)
    foto_salida = Column(String(255), nullable=True)  # Ruta de la foto del trabajo terminado
    
    # Información de contacto para notificaciones
    nombre_contacto_notificacion = Column(String(200), nullable=True)  # Nombre del contacto para notificar
    telefono_contacto_notificacion = Column(String(15), nullable=True)  # Teléfono del contacto para notificar
    
    # Tipo de permiso/documento
    tipo_permiso = Column(SQLEnum(TipoPermisoEnum), nullable=True)
    numero_permiso = Column(String(50), nullable=True)  # Número de OC, cotización, etc.
    
    # Precios
    precio_estimado = Column(Numeric(10, 2), nullable=True)  # Precio sugerido/estimado
    anticipo = Column(Numeric(10, 2), default=0.00, nullable=False)  # Anticipo recibido
    precio_final = Column(Numeric(10, 2), nullable=True)  # Precio final acordado
    
    # Estado y prioridad (aceptan mayúsculas/minúsculas en BD para compatibilidad)
    estatus = Column(_EnumStringType(EstadoOrdenEnum), default=EstadoOrdenEnum.RECIBIDO, nullable=False, index=True)
    prioridad = Column(_EnumStringType(PrioridadEnum), default=PrioridadEnum.NORMAL, nullable=False, index=True)
    
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
    sucursal = relationship("Sucursal", back_populates="ordenes_trabajo")
    categoria = relationship("CategoriaOrden", backref="ordenes")
    subcategoria = relationship("SubcategoriaOrden", backref="ordenes")
    usuario_recepcion = relationship("User", foreign_keys=[usuario_recepcion_id], backref="ordenes_recepcionadas")
    tecnico = relationship("User", foreign_keys=[tecnico_asignado_id], backref="ordenes_asignadas")
    subtareas = relationship("SubtareaOrden", back_populates="orden_trabajo", cascade="all, delete-orphan")
    sub_ordenes = relationship("SubOrdenTrabajo", back_populates="orden_trabajo", cascade="all, delete-orphan", order_by="SubOrdenTrabajo.orden")
    piezas_usadas = relationship("OrdenTrabajoPieza", back_populates="orden_trabajo", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<OrdenTrabajo {self.folio} - {self.estatus}>"
    
    def _normalize_dt(self, dt):
        """Convierte datetime naive a aware (UTC) para evitar errores de comparación con MySQL."""
        from datetime import timezone
        if dt is None:
            return None
        if getattr(dt, "tzinfo", None) is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt

    def _estatus_entregado_o_finalizado(self):
        """True si la orden está entregada o finalizada (acepta enum o string de la BD)."""
        if self.estatus is None:
            return False
        val = getattr(self.estatus, "value", None) or str(self.estatus)
        return str(val).upper() in ("ENTREGADO", "FINALIZADO")

    @property
    def dias_desde_recepcion(self):
        """Calcula los días desde la recepción"""
        from datetime import datetime, timezone
        recepcion = self._normalize_dt(self.fecha_recepcion)
        if recepcion is None:
            return 0
        now = datetime.now(timezone.utc)
        if self.fecha_entrega:
            entrega = self._normalize_dt(self.fecha_entrega)
            if entrega is not None:
                return (entrega - recepcion).days
        return (now - recepcion).days

    @property
    def esta_retrasada(self):
        """Verifica si la orden está retrasada respecto a la fecha promesa"""
        from datetime import datetime, timezone
        if not self.fecha_promesa or self._estatus_entregado_o_finalizado():
            return False
        promesa = self._normalize_dt(self.fecha_promesa)
        if promesa is None:
            return False
        now = datetime.now(timezone.utc)
        return now > promesa

    @property
    def total_piezas(self):
        """Suma del costo de piezas usadas en esta OT."""
        try:
            usos = getattr(self, "piezas_usadas", None) or []
            return sum(
                float(getattr(u, "precio_unitario", 0) or 0) * int(getattr(u, "cantidad", 0) or 0)
                for u in usos
            )
        except (TypeError, ValueError):
            return 0.0

    @property
    def saldo_pendiente(self):
        """Calcula el saldo pendiente (base + gastos + piezas - anticipo)"""
        try:
            anticipo = self.anticipo if self.anticipo is not None else 0
            base = self.precio_final if self.precio_final is not None else (self.precio_estimado if self.precio_estimado is not None else 0)
            total_gastos = 0
            gastos = getattr(self, "gastos", None)
            if gastos:
                for g in gastos:
                    try:
                        total_gastos += float(getattr(g, "monto", 0) or 0)
                    except (TypeError, ValueError):
                        continue
            total_piezas = self.total_piezas
            total = float(base) + float(total_gastos) + float(total_piezas)
            return float(total - float(anticipo or 0))
        except (TypeError, ValueError):
            return 0.0

    @property
    def porcentaje_completado(self):
        """Calcula el porcentaje de completado basado en subtareas"""
        if not self.subtareas:
            return 0
        try:
            completadas = sum(
                1 for st in self.subtareas
                if (getattr(st.estado, "value", None) or str(st.estado or "")).upper() == "COMPLETADA"
            )
            return int((completadas / len(self.subtareas)) * 100)
        except (TypeError, ZeroDivisionError):
            return 0
