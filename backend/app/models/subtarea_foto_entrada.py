"""Fotos de entrada por subtarea (como en la OT principal)."""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class SubtareaFotoEntrada(Base):
    __tablename__ = "subtarea_fotos_entrada"

    id = Column(Integer, primary_key=True, index=True)
    subtarea_id = Column(Integer, ForeignKey("subtareas_orden.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(512), nullable=False)

    subtarea = relationship("SubtareaOrden", backref="fotos_entrada_list_rel")
