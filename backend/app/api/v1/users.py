from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.models.user import User, RolEnum
from app.core.dependencies import get_current_active_user, require_role
from app.core.security import get_password_hash

router = APIRouter(prefix="/users", tags=["Usuarios"])


@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "RECEPCION"]))
):
    """
    Obtener lista de usuarios (ADMIN y RECEPCION, para asignar técnicos en órdenes).
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """
    Obtener un usuario por ID (solo ADMIN)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """
    Crear nuevo usuario (solo ADMIN)
    """
    # Verificar si el username ya existe
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está registrado"
        )
    
    # Verificar si el email ya existe
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    if user_data.codigo and db.query(User).filter(User.codigo == user_data.codigo).first():
        raise HTTPException(status_code=400, detail="El código ya está asignado a otro usuario")
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        nombre_completo=user_data.nombre_completo,
        password_hash=hashed_password,
        rol=user_data.rol,
        activo=True,
        codigo=user_data.codigo
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """
    Actualizar usuario (solo ADMIN)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Verificar si se está intentando cambiar el rol de un ADMIN
    if user_data.rol is not None and user.rol == RolEnum.ADMIN and user_data.rol != RolEnum.ADMIN:
        # Contar cuántos admins hay
        admin_count = db.query(User).filter(User.rol == RolEnum.ADMIN).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede cambiar el rol del último administrador. Debe haber al menos un administrador en el sistema."
            )
    
    # Verificar si se está intentando desactivar al último ADMIN
    if user_data.activo is not None and not user_data.activo and user.rol == RolEnum.ADMIN:
        admin_count = db.query(User).filter(
            User.rol == RolEnum.ADMIN,
            User.activo == True
        ).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede desactivar al último administrador activo. Debe haber al menos un administrador activo en el sistema."
            )
    
    # Actualizar campos si se proporcionan
    update_data = user_data.model_dump(exclude_unset=True)
    
    if 'codigo' in update_data and update_data['codigo']:
        existing_codigo = db.query(User).filter(User.codigo == update_data['codigo'], User.id != user_id).first()
        if existing_codigo:
            raise HTTPException(status_code=400, detail="El código ya está asignado a otro usuario")
    if 'email' in update_data:
        existing_email = db.query(User).filter(
            User.email == update_data['email'],
            User.id != user_id
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está en uso"
            )
    
    # Si hay contraseña, hashearla
    if 'password' in update_data:
        update_data['password_hash'] = get_password_hash(update_data['password'])
        del update_data['password']
    
    # Actualizar todos los campos proporcionados
    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """
    Eliminar usuario (solo ADMIN)
    """
    # No permitir eliminar el propio usuario
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propio usuario"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Verificar si es el último administrador
    if user.rol == RolEnum.ADMIN:
        admin_count = db.query(User).filter(User.rol == RolEnum.ADMIN).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede eliminar al último administrador. Debe haber al menos un administrador en el sistema."
            )
    
    db.delete(user)
    db.commit()
    
    return None


@router.get("/roles/list", response_model=List[str])
def get_roles(
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtener lista de roles disponibles
    """
    return [rol.value for rol in RolEnum]
