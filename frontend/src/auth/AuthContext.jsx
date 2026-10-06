import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginApi } from '../api/auth'
import { clearToken, getToken, setToken, setUnauthorizedHandler } from '../api/client'
import { decodeJwt, isExpired, normalizeRole } from './jwt'

const AuthContext = createContext(null)

function sessionFromToken(token, rolRespuesta) {
  if (!token) return null
  const claims = decodeJwt(token)
  if (isExpired(claims)) return null
  const rol = normalizeRole(claims.rol || claims.role || claims.roles || claims.authorities) || normalizeRole(rolRespuesta)
  return { token, id: Number(claims.sub), email: claims.email, rol, exp: claims.exp }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const s = sessionFromToken(getToken())
    if (!s) clearToken()
    return s
  })

  const logout = useCallback(() => {
    clearToken()
    setSession(null)
  }, [])

  // Cualquier 401 cierra sesión; el ProtectedRoute redirige a /login
  useEffect(() => { setUnauthorizedHandler(logout) }, [logout])

  // Cierra sesión automáticamente cuando el token expira
  useEffect(() => {
    if (!session?.exp) return
    const ms = session.exp * 1000 - Date.now()
    const t = setTimeout(logout, Math.max(ms, 0))
    return () => clearTimeout(t)
  }, [session, logout])

  const login = useCallback(async (email, password) => {
    const data = await loginApi(email, password)
    setToken(data.token)
    setSession(sessionFromToken(data.token, data.rol))
  }, [])

  const value = useMemo(() => ({
    user: session,
    isAdmin: session?.rol === 'ADMINISTRADOR',
    login,
    logout,
  }), [session, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
