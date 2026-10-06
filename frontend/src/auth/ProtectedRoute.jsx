import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

// soloAdmin: restringe la ruta al rol Administrador
export default function ProtectedRoute({ soloAdmin = false }) {
  const { user, isAdmin } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (soloAdmin && !isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
