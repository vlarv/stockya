# StockYa AI – Frontend

React + Vite (JavaScript) para el backend Spring Boot de StockYa.

## Cómo correrlo

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción en dist/
```

El backend debe estar corriendo en `http://localhost:8080`.

## Configuración

Copia `.env.example` a `.env` si necesitas cambiar algo:

| Variable            | Por defecto             | Descripción |
|---------------------|-------------------------|-------------|
| `VITE_API_URL`      | `/api`                  | URL base que usa el frontend. Con el valor por defecto las peticiones pasan por el proxy de Vite (`/api/*` → backend, quitando `/api`), sin CORS. En producción pon la URL completa del backend, p. ej. `https://mi-api.com` (el backend debe permitir CORS). |
| `VITE_PROXY_TARGET` | `http://localhost:8080` | Destino del proxy de desarrollo. |

## Usuarios de prueba
- `admin@stockya.com` / `Admin123!` (Administrador)
- `almacen@stockya.com` / `Almacen123!` (Almacenero)

## Asistente IA
`src/services/asistente.js` tiene la bandera `USE_MOCK = true`. Cuando exista `POST /asistente/consultar` en el backend, ponla en `false`.
