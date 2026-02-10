from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.sucursal import Sucursal
from app.models.cliente import Cliente
from app.schemas.sucursal import SucursalCreate, SucursalUpdate, SucursalResponse
from app.core.dependencies import require_role

router = APIRouter()


@router.get("/sucursales", response_model=List[SucursalResponse])
def get_sucursales(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    cliente_id: Optional[int] = Query(None, description="Filtrar por cliente"),
    activo: Optional[bool] = Query(None, description="Filtrar por estado activo"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"]))
):
    """Obtener lista de sucursales con filtros opcionales"""
    query = db.query(Sucursal).options(joinedload(Sucursal.cliente))
    
    if cliente_id is not None:
        query = query.filter(Sucursal.cliente_id == cliente_id)
    
    if activo is not None:
        query = query.filter(Sucursal.activo == activo)
    
    sucursales = query.offset(skip).limit(limit).all()
    
    # Agregar información del cliente a cada sucursal
    result = []
    for sucursal in sucursales:
        sucursal_dict = {
            "id": sucursal.id,
            "cliente_id": sucursal.cliente_id,
            "nombre_sucursal": sucursal.nombre_sucursal,
            "codigo_sucursal": sucursal.codigo_sucursal,
            "telefono": sucursal.telefono,
            "telefono_alternativo": sucursal.telefono_alternativo,
            "email": sucursal.email,
            "calle": sucursal.calle,
            "numero_exterior": sucursal.numero_exterior,
            "numero_interior": sucursal.numero_interior,
            "colonia": sucursal.colonia,
            "codigo_postal": sucursal.codigo_postal,
            "ciudad": sucursal.ciudad,
            "estado": sucursal.estado,
            "notas": sucursal.notas,
            "activo": sucursal.activo,
            "created_at": sucursal.created_at,
            "updated_at": sucursal.updated_at,
            "direccion_completa": sucursal.direccion_completa,
            "cliente_nombre": sucursal.cliente.nombre_completo if sucursal.cliente else None,
            "cliente_rfc": sucursal.cliente.rfc if sucursal.cliente else None
        }
        result.append(sucursal_dict)
    
    return result


@router.get("/sucursales/{sucursal_id}", response_model=SucursalResponse)
def get_sucursal(
    sucursal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"]))
):
    """Obtener una sucursal por ID"""
    sucursal = db.query(Sucursal).options(
        joinedload(Sucursal.cliente)
    ).filter(Sucursal.id == sucursal_id).first()
    
    if not sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    
    sucursal_dict = {
        "id": sucursal.id,
        "cliente_id": sucursal.cliente_id,
        "nombre_sucursal": sucursal.nombre_sucursal,
        "codigo_sucursal": sucursal.codigo_sucursal,
        "telefono": sucursal.telefono,
        "telefono_alternativo": sucursal.telefono_alternativo,
        "email": sucursal.email,
        "calle": sucursal.calle,
        "numero_exterior": sucursal.numero_exterior,
        "numero_interior": sucursal.numero_interior,
        "colonia": sucursal.colonia,
        "codigo_postal": sucursal.codigo_postal,
        "ciudad": sucursal.ciudad,
        "estado": sucursal.estado,
        "notas": sucursal.notas,
        "activo": sucursal.activo,
        "created_at": sucursal.created_at,
        "updated_at": sucursal.updated_at,
        "direccion_completa": sucursal.direccion_completa,
        "cliente_nombre": sucursal.cliente.nombre_completo if sucursal.cliente else None,
        "cliente_rfc": sucursal.cliente.rfc if sucursal.cliente else None
    }
    
    return sucursal_dict


@router.post("/sucursales", response_model=SucursalResponse, status_code=status.HTTP_201_CREATED)
def create_sucursal(
    sucursal: SucursalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION"]))
):
    """Crear una nueva sucursal"""
    # Verificar que el cliente existe
    cliente = db.query(Cliente).filter(Cliente.id == sucursal.cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Crear la sucursal
    db_sucursal = Sucursal(**sucursal.model_dump())
    db.add(db_sucursal)
    db.commit()
    db.refresh(db_sucursal)
    
    # Cargar relación con cliente
    db_sucursal = db.query(Sucursal).options(
        joinedload(Sucursal.cliente)
    ).filter(Sucursal.id == db_sucursal.id).first()
    
    sucursal_dict = {
        "id": db_sucursal.id,
        "cliente_id": db_sucursal.cliente_id,
        "nombre_sucursal": db_sucursal.nombre_sucursal,
        "codigo_sucursal": db_sucursal.codigo_sucursal,
        "telefono": db_sucursal.telefono,
        "telefono_alternativo": db_sucursal.telefono_alternativo,
        "email": db_sucursal.email,
        "calle": db_sucursal.calle,
        "numero_exterior": db_sucursal.numero_exterior,
        "numero_interior": db_sucursal.numero_interior,
        "colonia": db_sucursal.colonia,
        "codigo_postal": db_sucursal.codigo_postal,
        "ciudad": db_sucursal.ciudad,
        "estado": db_sucursal.estado,
        "notas": db_sucursal.notas,
        "activo": db_sucursal.activo,
        "created_at": db_sucursal.created_at,
        "updated_at": db_sucursal.updated_at,
        "direccion_completa": db_sucursal.direccion_completa,
        "cliente_nombre": db_sucursal.cliente.nombre_completo if db_sucursal.cliente else None,
        "cliente_rfc": db_sucursal.cliente.rfc if db_sucursal.cliente else None
    }
    
    return sucursal_dict


@router.put("/sucursales/{sucursal_id}", response_model=SucursalResponse)
def update_sucursal(
    sucursal_id: int,
    sucursal: SucursalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION"]))
):
    """Actualizar una sucursal"""
    db_sucursal = db.query(Sucursal).filter(Sucursal.id == sucursal_id).first()
    if not db_sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    
    # Actualizar campos
    update_data = sucursal.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_sucursal, field, value)
    
    db.commit()
    db.refresh(db_sucursal)
    
    # Cargar relación con cliente
    db_sucursal = db.query(Sucursal).options(
        joinedload(Sucursal.cliente)
    ).filter(Sucursal.id == db_sucursal.id).first()
    
    sucursal_dict = {
        "id": db_sucursal.id,
        "cliente_id": db_sucursal.cliente_id,
        "nombre_sucursal": db_sucursal.nombre_sucursal,
        "codigo_sucursal": db_sucursal.codigo_sucursal,
        "telefono": db_sucursal.telefono,
        "telefono_alternativo": db_sucursal.telefono_alternativo,
        "email": db_sucursal.email,
        "calle": db_sucursal.calle,
        "numero_exterior": db_sucursal.numero_exterior,
        "numero_interior": db_sucursal.numero_interior,
        "colonia": db_sucursal.colonia,
        "codigo_postal": db_sucursal.codigo_postal,
        "ciudad": db_sucursal.ciudad,
        "estado": db_sucursal.estado,
        "notas": db_sucursal.notas,
        "activo": db_sucursal.activo,
        "created_at": db_sucursal.created_at,
        "updated_at": db_sucursal.updated_at,
        "direccion_completa": db_sucursal.direccion_completa,
        "cliente_nombre": db_sucursal.cliente.nombre_completo if db_sucursal.cliente else None,
        "cliente_rfc": db_sucursal.cliente.rfc if db_sucursal.cliente else None
    }
    
    return sucursal_dict


@router.delete("/sucursales/{sucursal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sucursal(
    sucursal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """Eliminar una sucursal"""
    db_sucursal = db.query(Sucursal).filter(Sucursal.id == sucursal_id).first()
    if not db_sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    
    db.delete(db_sucursal)
    db.commit()
    return None
