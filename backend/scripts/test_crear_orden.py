"""
Prueba de creación de orden de trabajo (orden de compra).
Valida que un usuario ADMIN o RECEPCION pueda crear órdenes correctamente.

Uso:
  Desde la raíz del backend:
    python -m scripts.test_crear_orden

  Variables de entorno (opcionales):
    API_BASE_URL  - Base URL del API (default: http://localhost:8000)
    TEST_USERNAME - Usuario con rol ADMIN o RECEPCION
    TEST_PASSWORD - Contraseña del usuario
"""
import os
import sys
import json
import urllib.request
import urllib.error
import ssl

API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8000")
TEST_USERNAME = os.environ.get("TEST_USERNAME", "")
TEST_PASSWORD = os.environ.get("TEST_PASSWORD", "")


def request(method, path, data=None, token=None):
    url = f"{API_BASE_URL.rstrip('/')}{path}"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    # Permitir certificados autofirmados en desarrollo
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
            return resp.getcode(), json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else "{}"
        try:
            detail = json.loads(body)
        except Exception:
            detail = body
        return e.code, detail
    except Exception as e:
        return None, str(e)


def main():
    print("=" * 60)
    print("Prueba: Creación de Orden de Trabajo")
    print("=" * 60)
    print(f"API: {API_BASE_URL}")
    print()

    if not TEST_USERNAME or not TEST_PASSWORD:
        print("ERROR: Define TEST_USERNAME y TEST_PASSWORD (usuario con rol ADMIN o RECEPCION).")
        print("Ejemplo: set TEST_USERNAME=admin && set TEST_PASSWORD=tu_password && python -m scripts.test_crear_orden")
        sys.exit(1)

    # 1. Login
    print("1. Iniciando sesión...")
    code, body = request("POST", "/api/v1/auth/login/json", {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD,
    })
    if code != 200:
        print(f"   ERROR login: {code} - {body}")
        if code == 401:
            print("   Usa un usuario con rol ADMIN o RECEPCION (TEST_USERNAME / TEST_PASSWORD).")
        sys.exit(1)
    token = body.get("access_token")
    if not token:
        print("   ERROR: No se recibió access_token.")
        sys.exit(1)
    print("   OK - Token obtenido.")

    # 2. Obtener o crear cliente
    print("2. Obteniendo cliente...")
    code, body = request("GET", "/api/v1/clientes?limit=1", token=token)
    if code != 200:
        print(f"   ERROR listar clientes: {code} - {body}")
        sys.exit(1)
    clientes = body if isinstance(body, list) else []
    if not clientes:
        print("   No hay clientes. Creando uno de prueba...")
        code, body = request("POST", "/api/v1/clientes", {
            "tipo_cliente": "PERSONA_FISICA",
            "nombre": "Cliente",
            "apellido_paterno": "Prueba",
            "telefono": "5512345678",
            "activo": True,
        }, token=token)
        if code not in (200, 201):
            print(f"   ERROR crear cliente: {code} - {body}")
            sys.exit(1)
        cliente_id = body.get("id")
        print(f"   OK - Cliente creado id={cliente_id}.")
    else:
        cliente_id = clientes[0].get("id")
        print(f"   OK - Usando cliente id={cliente_id}.")

    # 3. Crear orden de trabajo
    print("3. Creando orden de trabajo...")
    orden_payload = {
        "cliente_id": cliente_id,
        "descripcion": "Prueba automatizada de creación de orden de trabajo - trabajo de torno y mediciones solicitadas.",
        "prioridad": "NORMAL",
        "estatus": "RECIBIDO",
        "anticipo": 0,
    }
    code, body = request("POST", "/api/v1/ordenes", orden_payload, token=token)
    if code not in (200, 201):
        print(f"   ERROR crear orden: {code}")
        if isinstance(body, dict):
            detail = body.get("detail", body)
            if isinstance(detail, list):
                for d in detail:
                    print(f"      - {d}")
            else:
                print(f"      {detail}")
        else:
            print(f"      {body}")
        sys.exit(1)

    # 4. Validar respuesta
    orden_id = body.get("id")
    folio = body.get("folio")
    if not orden_id or not folio:
        print("   ERROR: La respuesta no incluye id o folio.")
        print("   Respuesta:", json.dumps(body, indent=2, default=str))
        sys.exit(1)

    print(f"   OK - Orden creada: id={orden_id}, folio={folio}.")
    print()
    print("=" * 60)
    print("Resultado: PRUEBA EXITOSA - La creación de órdenes funciona correctamente.")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main() or 0)
