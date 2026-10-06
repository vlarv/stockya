import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Field from '../components/Field'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password) return setError('Ingresa tu correo y contraseña')
    setBusy(true)
    setError('')
    try {
      await login(form.email.trim(), form.password)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (err) {
      setError(err.status === 401 ? 'Correo o contraseña incorrectos' : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={submit} noValidate>
        <h1 className="brand">StockYa <span>AI</span></h1>
        <p className="muted">Gestión de inventario para tu bodega</p>
        {error && <div className="alert alert-error">{error}</div>}
        <Field label="Correo electrónico">
          <input type="email" autoFocus autoComplete="username" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Contraseña">
          <input type="password" autoComplete="current-password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
