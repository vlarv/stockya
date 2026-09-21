# StockYa

API REST de control de inventario: categorías, productos, movimientos de stock y usuarios, con login JWT y permisos por rol.

**Stack:** Java 21 · Spring Boot 4 · Spring Data JPA · Spring Security + JWT · Flyway · PostgreSQL · MapStruct · Lombok · Gradle

## Requisitos

- JDK 21
- PostgreSQL con una base vacía llamada `stockya_db` (hay que crearla a mano)

```sql
CREATE DATABASE stockya_db;
```

## Configuración

Los valores por defecto están en `src/main/resources/application.properties`:

| Propiedad | Valor por defecto | Variable de entorno para cambiarlo |
|---|---|---|
| URL de la base | `jdbc:postgresql://localhost:5432/stockya_db` | `SPRING_DATASOURCE_URL` |
| Usuario de la base | `postgres` | `SPRING_DATASOURCE_USERNAME` |
| Contraseña de la base | `12345` | `SPRING_DATASOURCE_PASSWORD` |
| Secreto del JWT | clave de desarrollo | `JWT_SECRET` (mínimo 32 caracteres) |
| Expiración del token | 60 minutos | — |

Si tu Postgres local usa otra contraseña, no edites el archivo del repo: define la variable de entorno.

```powershell
$env:SPRING_DATASOURCE_PASSWORD = "mi_password"
```

## Ejecutar

```bash
./gradlew bootRun     # Windows: gradlew.bat bootRun
```

Al arrancar, Flyway aplica las migraciones `V1` (tablas, trigger de stock, datos base) y `V2` (usuarios de prueba). La API queda en `http://localhost:8080`.

Los tests (`./gradlew test`) también necesitan la base disponible con la misma configuración.

## Usuarios de prueba

Creados por la migración `V2`. **Solo para desarrollo: cámbialos o elimínalos antes de producción.**

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@stockya.com` | `Admin123!` |
| Almacenero | `almacen@stockya.com` | `Almacen123!` |

## Autenticación

Todos los endpoints, salvo `/auth/**`, requieren un token.

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stockya.com","password":"Admin123!"}'
```

La respuesta trae `token`, `tipo`, `expiraEnMinutos` y `rol`. Envía el token en cada petición:

```
Authorization: Bearer <token>
```

El email no distingue mayúsculas de minúsculas.

## Permisos por rol

| Recurso | Administrador | Almacenero |
|---|---|---|
| Categorías, productos, tipos de movimiento (GET) | ✅ | ✅ |
| Categorías, productos (POST / PUT / DELETE) | ✅ | ❌ 403 |
| Movimientos | Todos | Solo los propios |
| Usuarios | ✅ (*) | ❌ 403 |

(*) Crear usuarios además exige que el rol del administrador tenga `puede_crear_usuarios = true`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Iniciar sesión, devuelve el JWT |
| GET, POST | `/categorias` | Listar / crear |
| GET, PUT, DELETE | `/categorias/{id}` | Consultar / editar / borrar |
| GET, POST | `/productos` | Listar / crear |
| GET | `/productos/stock-bajo` | Productos con `stock <= stockMinimo` |
| GET, PUT, DELETE | `/productos/{id}` | Consultar / editar / borrar |
| GET | `/tipos-movimiento` | Tipos de movimiento (Venta, Compra, etc.) |
| GET, POST | `/movimientos` | Listar / registrar un movimiento con sus detalles |
| GET, PUT, DELETE | `/movimientos/{id}` | Consultar / editar observaciones / borrar |
| GET, POST | `/usuarios` | Listar / crear (solo administrador) |
| GET, PUT, DELETE | `/usuarios/{id}` | Consultar / editar / borrar (solo administrador) |

Ejemplo de movimiento (el responsable es siempre el usuario autenticado):

```json
POST /movimientos
{
  "tipoMovimientoId": 2,
  "referenciaExterna": "OC-001",
  "observaciones": "Reposición mensual",
  "detalles": [
    { "productoId": 1, "cantidad": 10, "costoUnitario": 2.50 }
  ]
}
```

## Reglas de negocio

- **El stock lo mantiene un trigger de la base de datos** (`trg_actualizar_stock`) al insertar, editar o borrar detalles de movimiento. Nunca se escribe desde Java.
- **No se puede sacar más stock del que hay.** Una salida (multiplicador `-1`) que lo supere responde `409`. Las líneas repetidas del mismo producto se suman, y la fila del producto se bloquea para evitar salidas simultáneas.
- **Borrar un movimiento revierte su efecto en el stock.** Si eso dejaría un producto en negativo, responde `409`.
- Un movimiento solo permite editar `referenciaExterna` y `observaciones`; los detalles no se modifican.
- No se puede borrar una categoría con productos, ni un producto o usuario con movimientos asociados (`409`).
- No puedes borrar tu propio usuario.
- El rol de un usuario no se puede cambiar; define su tipo (Administrador o Empleado).

## Formato de errores

```json
{ "status": 409, "message": "Stock insuficiente para 'Agua': disponible 15, solicitado 16" }
```

Los errores de validación (`400`) incluyen el detalle por campo en `fields`.

## Migraciones

Las migraciones están en `src/main/resources/db/migration`. No edites una migración ya aplicada: Flyway valida su checksum y la app dejará de arrancar. Los cambios nuevos van en un `V3__...sql`.
