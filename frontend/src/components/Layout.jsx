import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { rolLabel } from '../auth/jwt'

const LINKS = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/productos', label: 'Productos', icon: '📦' },
  { to: '/categorias', label: 'Categorías', icon: '🏷️', admin: true },
  { to: '/movimientos', label: 'Movimientos', icon: '🔁' },
  { to: '/usuarios', label: 'Usuarios', icon: '👥', admin: true },
  { to: '/asistente', label: 'Asistente IA', icon: '🤖' },
]

export default function Layout() {
  const { user, isAdmin, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="app">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">StockYa <span>AI</span></div>
        <nav onClick={() => setOpen(false)}>
          {LINKS.filter((l) => !l.admin || isAdmin).map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-box">
          <div className="user-email">{user.email}</div>
          <div className="user-rol">{rolLabel(user.rol)}</div>
          <button className="btn btn-sm" onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="btn-icon" onClick={() => setOpen(!open)} aria-label="Menú">☰</button>
          <strong>StockYa AI</strong>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  )
}
