from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import Token, UserLogin, UserCreate, UserResponse, LoginTecnicoCodigo
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login de usuario
    
    - **username**: Nombre de usuario
    - **password**: Contraseña
    
    Retorna un token JWT
    """
    credentials = UserLogin(username=form_data.username, password=form_data.password)
    token = AuthService.login(db, credentials)
    return token


@router.post("/login/json", response_model=Token)
def login_json(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login de usuario (JSON)
    
    - **username**: Nombre de usuario
    - **password**: Contraseña
    
    Retorna un token JWT
    """
    token = AuthService.login(db, credentials)
    return token


@router.post("/login/tecnico", response_model=Token)
def login_tecnico(
    body: LoginTecnicoCodigo,
    db: Session = Depends(get_db)
):
    """
    Login de técnico por código de 4 dígitos.
    El técnico debe tener asignado un código en su perfil de usuario.
    Redirige al dashboard de trabajo (órdenes).
    """
    token = AuthService.login_tecnico_por_codigo(db, body.codigo)
    return token


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registrar nuevo usuario
    
    - **username**: Nombre de usuario (único)
    - **email**: Email (único)
    - **nombre_completo**: Nombre completo
    - **password**: Contraseña (mínimo 6 caracteres)
    - **rol**: Rol del usuario (admin, tecnico, recepcion)
    """
    user = AuthService.register_user(db, user_data)
    return user


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Obtener información del usuario actual
    
    Requiere autenticación
    """
    return current_user


@router.post("/logout")
def logout():
    """
    Logout de usuario
    
    El logout se maneja en el frontend eliminando el token
    """
    return {"message": "Logout exitoso"}
