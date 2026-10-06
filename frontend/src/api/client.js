const BASE_URL = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'stockya_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// El AuthContext registra aquí qué hacer ante un 401 (cerrar sesión y redirigir).
let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

export class ApiError extends Error {
  constructor(status, message, fields = null) {
    super(message)
    this.status = status
    this.fields = fields // { campo: "mensaje" } en errores 400 de validación
  }
}

export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor')
  }

  if (res.status === 204) return null
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { /* respuesta no JSON */ }

  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized()
    const fallback = {
      401: 'Credenciales inválidas o sesión expirada',
      403: 'No tienes permiso para realizar esta acción',
      404: 'Recurso no encontrado',
    }[res.status] || 'Error inesperado del servidor'
    throw new ApiError(res.status, data?.message || fallback, data?.fields || null)
  }
  return data
}

// Fábrica de CRUD estándar para un recurso REST
export const crud = (base) => ({
  listar: () => request(base),
  obtener: (id) => request(`${base}/${id}`),
  crear: (body) => request(base, { method: 'POST', body }),
  actualizar: (id, body) => request(`${base}/${id}`, { method: 'PUT', body }),
  eliminar: (id) => request(`${base}/${id}`, { method: 'DELETE' }),
})
