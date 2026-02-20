"""Fotos de entrada múltiples por orden (tabla separada para no alterar ordenes_trabajo)."""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class OrdenFotoEntrada(Base):
    __tablename__ = "orden_fotos_entrada"

    id = Column(Integer, primary_key=True, index=True)
    orden_id = Column(Integer, ForeignKey("ordenes_trabajo.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(512), nullable=False)  # ej: /uploads/ordenes/OT-2026-0001_entrada_xxx.jpg

    orden = relationship("OrdenTrabajo", backref="fotos_entrada_list_rel")
