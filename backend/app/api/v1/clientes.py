from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse
from app.core.dependencies import get_current_active_user, require_role

router = APIRouter(tags=["clientes"])


@router.get("/clientes", response_model=List[ClienteResponse])
def get_clientes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION"])),
    skip: int = 0,
    limit: int = 100,
    buscar: Optional[str] = None,
    activo: Optional[bool] = None
):
    """
    Obtener lista de clientes (ADMIN y RECEPCION)
    """
    query = db.query(Cliente)
    
    # Filtrar por búsqueda
    if buscar:
        search_filter = f"%{buscar}%"
        query = query.filter(
            (Cliente.nombre.ilike(search_filter)) |
            (Cliente.apellido_paterno.ilike(search_filter)) |
            (Cliente.apellido_materno.ilike(search_filter)) |
            (Cliente.razon_social.ilike(search_filter)) |
            (Cliente.rfc.ilike(search_filter)) |
            (Cliente.telefono.ilike(search_filter)) |
            (Cliente.email.ilike(search_filter))
        )
    
    # Filtrar por estado
    if activo is not None:
        query = query.filter(Cliente.activo == activo)
    
    clientes = query.order_by(Cliente.created_at.desc()).offset(skip).limit(limit).all()
    
    # Agregar campos calculados
    result = []
    for cliente in clientes:
        cliente_dict = ClienteResponse.from_orm(cliente).dict()
        cliente_dict['nombre_completo'] = cliente.nombre_completo
        cliente_dict['direccion_completa'] = cliente.direccion_completa
        result.append(cliente_dict)
    
    return result


@router.get("/clientes/{cliente_id}", response_model=ClienteResponse)
def get_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION", "TECNICO"]))
):
    """
    Obtener un cliente por ID
    """
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    
    cliente_dict = ClienteResponse.from_orm(cliente).dict()
    cliente_dict['nombre_completo'] = cliente.nombre_completo
    cliente_dict['direccion_completa'] = cliente.direccion_completa
    
    return cliente_dict


@router.post("/clientes", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def create_cliente(
    cliente: ClienteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION"]))
):
    """
    Crear un nuevo cliente (ADMIN y RECEPCION)
    """
    # Validar RFC único si se proporciona
    if cliente.rfc:
        existing_rfc = db.query(Cliente).filter(Cliente.rfc == cliente.rfc).first()
        if existing_rfc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un cliente con este RFC"
            )
    
    # Validar email único si se proporciona
    if cliente.email:
        existing_email = db.query(Cliente).filter(Cliente.email == cliente.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un cliente con este email"
            )
    
    # Crear cliente
    db_cliente = Cliente(**cliente.dict())
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    
    cliente_dict = ClienteResponse.from_orm(db_cliente).dict()
    cliente_dict['nombre_completo'] = db_cliente.nombre_completo
    cliente_dict['direccion_completa'] = db_cliente.direccion_completa
    
    return cliente_dict


@router.put("/clientes/{cliente_id}", response_model=ClienteResponse)
def update_cliente(
    cliente_id: int,
    cliente_data: ClienteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION"]))
):
    """
    Actualizar un cliente (ADMIN y RECEPCION)
    """
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    
    update_data = cliente_data.dict(exclude_unset=True)
    
    # Validar RFC único si se está actualizando
    if 'rfc' in update_data and update_data['rfc']:
        existing_rfc = db.query(Cliente).filter(
            Cliente.rfc == update_data['rfc'],
            Cliente.id != cliente_id
        ).first()
        if existing_rfc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un cliente con este RFC"
            )
    
    # Validar email único si se está actualizando
    if 'email' in update_data and update_data['email']:
        existing_email = db.query(Cliente).filter(
            Cliente.email == update_data['email'],
            Cliente.id != cliente_id
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un cliente con este email"
            )
    
    # Actualizar campos
    for key, value in update_data.items():
        setattr(cliente, key, value)
    
    db.commit()
    db.refresh(cliente)
    
    cliente_dict = ClienteResponse.from_orm(cliente).dict()
    cliente_dict['nombre_completo'] = cliente.nombre_completo
    cliente_dict['direccion_completa'] = cliente.direccion_completa
    
    return cliente_dict


@router.delete("/clientes/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """
    Eliminar un cliente (solo ADMIN)
    """
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    
    # En lugar de eliminar, desactivar
    cliente.activo = False
    db.commit()
    
    return None


@router.post("/{cliente_id}/activar", response_model=ClienteResponse)
def activar_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION"]))
):
    """
    Activar un cliente desactivado
    """
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    
    cliente.activo = True
    db.commit()
    db.refresh(cliente)
    
    cliente_dict = ClienteResponse.from_orm(cliente).dict()
    cliente_dict['nombre_completo'] = cliente.nombre_completo
    cliente_dict['direccion_completa'] = cliente.direccion_completa
    
    return cliente_dict
