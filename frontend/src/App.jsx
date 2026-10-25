import { Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import Layout from './components/Layout'
import Asistente from './pages/Asistente'
import Categorias from './pages/Categorias'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Movimientos from './pages/Movimientos'
import NotFound from './pages/NotFound'
import Productos from './pages/Productos'
import Usuarios from './pages/Usuarios'

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/asistente" element={<Asistente />} />
          <Route element={<ProtectedRoute soloAdmin />}>
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Route>
      {/* 404: con menú si hay sesión, a pantalla completa si no */}
      <Route path="*" element={user ? <Layout /> : <Outlet />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
