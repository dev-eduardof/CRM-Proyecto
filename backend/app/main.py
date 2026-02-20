from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import os
import pathlib
import traceback

# Importar routers
from app.api.v1 import auth, users, vacaciones, incidencias, clientes, ordenes, sucursales
from app.database import engine
from app.models import OrdenFotoEntrada

# Orígenes permitidos para CORS (desarrollo)
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def _add_cors_headers(response, origin: str):
    """Añade cabeceras CORS a cualquier respuesta."""
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept"
    return response


class EnsureCORSHeadersMiddleware(BaseHTTPMiddleware):
    """Asegura que todas las respuestas tengan cabeceras CORS (incluso en errores 500)."""
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "") or request.headers.get("Origin", "")
        if origin not in CORS_ORIGINS:
            origin = CORS_ORIGINS[0]

        # Respuesta a OPTIONS (preflight) con CORS
        if request.method == "OPTIONS":
            resp = JSONResponse(content={}, status_code=200)
            return _add_cors_headers(resp, origin)

        try:
            response = await call_next(request)
            return _add_cors_headers(response, origin)
        except Exception as exc:
            # Si hay error 500, devolver respuesta con CORS para que el navegador no muestre error CORS
            traceback.print_exc()
            resp = JSONResponse(
                status_code=500,
                content={"detail": "Error interno del servidor", "error": str(exc)},
            )
            return _add_cors_headers(resp, origin)


app = FastAPI(
    title="CRM Talleres API",
    description="API para Sistema de Gestión de Talleres",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


@app.on_event("startup")
def startup_create_tables():
    """Crea tablas/columnas que puedan faltar (sin alterar datos existentes)."""
    try:
        OrdenFotoEntrada.__table__.create(engine, checkfirst=True)
    except Exception as e:
        print(f"Nota: orden_fotos_entrada (puede existir ya): {e}")
    # Columna codigo en usuarios (login técnicos): añadir si no existe
    from sqlalchemy import text
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE usuarios ADD COLUMN codigo VARCHAR(4) NULL UNIQUE"))
        print("Columna usuarios.codigo creada correctamente.")
    except Exception as e:
        if "Duplicate column" in str(e) or "already exists" in str(e).lower():
            print("Columna usuarios.codigo ya existe.")
        else:
            print(f"Nota al añadir codigo a usuarios (puede existir ya): {e}")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Asegura que errores no controlados devuelvan respuesta con CORS (evita ver CORS en consola)."""
    from fastapi import HTTPException
    if isinstance(exc, HTTPException):
        raise exc  # Dejar que FastAPI maneje 401, 404, etc. (el middleware añade CORS a la respuesta)
    traceback.print_exc()
    origin = request.headers.get("origin") or request.headers.get("Origin") or CORS_ORIGINS[0]
    if origin not in CORS_ORIGINS:
        origin = CORS_ORIGINS[0]
    resp = JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor", "error": str(exc)},
    )
    return _add_cors_headers(resp, origin)

# Middleware CORS explícito primero (se ejecuta último = más externo)
app.add_middleware(EnsureCORSHeadersMiddleware)

# CORS estándar de FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Montar carpeta de uploads (crear si no existe)
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Health check
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "crm-talleres-backend",
        "version": "1.0.0"
    }

# Incluir routers ANTES de montar el frontend
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(vacaciones.router, prefix="/api/v1")
app.include_router(incidencias.router, prefix="/api/v1")
app.include_router(clientes.router, prefix="/api/v1")
app.include_router(sucursales.router, prefix="/api/v1")
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
