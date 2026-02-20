from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, Token, LoginTecnicoCodigo
from app.core.security import verify_password, get_password_hash, create_access_token
from app.config import settings


class AuthService:
    """Servicio de autenticación"""
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> User:
        """Autenticar usuario"""
        # Buscar usuario por username
        user = db.query(User).filter(User.username == username).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verificar password
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verificar que esté activo
        if not user.activo:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario inactivo"
            )
        
        return user
    
    @staticmethod
    def create_token(user: User) -> Token:
        """Crear token de acceso"""
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": user.username,
                "user_id": user.id,
                "rol": user.rol.value
            },
            expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")
    
    @staticmethod
    def login(db: Session, credentials: UserLogin) -> Token:
        """Login de usuario"""
        user = AuthService.authenticate_user(db, credentials.username, credentials.password)
        token = AuthService.create_token(user)
        return token

    @staticmethod
    def login_tecnico_por_codigo(db: Session, codigo: str) -> Token:
        """Login de técnico por código de 4 dígitos. Redirige a dashboard de trabajo."""
        from app.models.user import RolEnum
        user = db.query(User).filter(
            User.codigo == codigo,
            User.rol == RolEnum.TECNICO,
            User.activo == True
        ).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Código incorrecto o no corresponde a un técnico activo",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return AuthService.create_token(user)
    
    @staticmethod
    def register_user(db: Session, user_data: UserCreate) -> User:
        """Registrar nuevo usuario"""
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
        
        # Crear usuario
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            nombre_completo=user_data.nombre_completo,
            password_hash=hashed_password,
            rol=user_data.rol,
            activo=True,
            codigo=getattr(user_data, "codigo", None)
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
