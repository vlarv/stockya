// Decodifica el payload del JWT (sin verificar firma; solo para leer datos en la UI)
export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(payload).split('').map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

export const isExpired = (claims) => !claims || (claims.exp && claims.exp * 1000 < Date.now())

// El rol puede venir como "ROLE_ADMINISTRADOR", "ADMINISTRADOR" o "Administrador"
export function normalizeRole(raw) {
  if (!raw) return null
  const r = String(Array.isArray(raw) ? raw[0] : raw).toUpperCase().replace(/^ROLE_/, '')
  return r === 'ADMINISTRADOR' || r === 'ALMACENERO' ? r : null
}

export const rolLabel = (rol) => (rol === 'ADMINISTRADOR' ? 'Administrador' : 'Almacenero')
