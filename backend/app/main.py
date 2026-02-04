from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import pathlib

# Importar routers
from app.api.v1 import auth, users, vacaciones, incidencias, clientes, ordenes

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
    allow_origins=["*"],  # Permitir todos los orígenes en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar carpeta de uploads (crear si no existe)
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Health check
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "crm-talleres-backend"
    }

# Incluir routers ANTES de montar el frontend
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(vacaciones.router, prefix="/api/v1")
app.include_router(incidencias.router, prefix="/api/v1")
app.include_router(clientes.router, prefix="/api/v1")
app.include_router(ordenes.router, prefix="/api/v1")

# Servir frontend estático al final (debe ser lo último)
frontend_dist = pathlib.Path(__file__).parent.parent.parent / "frontend" / "dist"
print(f"Buscando frontend en: {frontend_dist}")
print(f"Existe: {frontend_dist.exists()}")
if frontend_dist.exists():
    print(f"Montando frontend desde: {frontend_dist}")
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
else:
    print("Frontend no encontrado, sirviendo solo API")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
