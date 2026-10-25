import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function NotFound() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className={`notfound ${user ? '' : 'notfound-full'}`}>
      <div className="card notfound-card">
        <div className="notfound-icon" aria-hidden="true">📦</div>
        <div className="notfound-code">404</div>
        <h1>Página no encontrada</h1>
        <p className="muted">La dirección que buscas no existe o fue movida.</p>
        <div className="notfound-actions">
          <Link to={user ? '/' : '/login'} className="btn btn-primary">
            {user ? 'Volver al inicio' : 'Ir al inicio de sesión'}
          </Link>
          <button className="btn" onClick={() => navigate(-1)}>Volver atrás</button>
        </div>
      </div>
    </div>
  )
}
