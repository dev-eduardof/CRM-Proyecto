from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Importar routers cuando estén disponibles
# from app.api.v1 import auth, users, clients, ordenes

app = FastAPI(
    title="CRM Talleres API",
    description="API para Sistema de Gestión de Talleres",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default port
        "http://frontend:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar carpeta de uploads (crear si no existe)
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "CRM Talleres API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Health check
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "crm-talleres-backend"
    }

# Incluir routers cuando estén disponibles
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
# app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
# app.include_router(clients.router, prefix="/api/v1/clients", tags=["clients"])
# app.include_router(ordenes.router, prefix="/api/v1/ordenes", tags=["ordenes"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
