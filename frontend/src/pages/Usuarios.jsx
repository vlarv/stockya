import { useState } from 'react'
import { usuariosApi } from '../api/usuarios'
import { useAuth } from '../auth/AuthContext'
import ConfirmModal from '../components/ConfirmModal'
import Estado from '../components/Estado'
import Field from '../components/Field'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { fecha } from '../format'
import { useApi } from '../useApi'

const ADMIN = 1
const ALMACENERO = 2

function UsuarioForm({ usuario, onSaved, onClose }) {
  const toast = useToast()
  const editando = !!usuario
  const [form, setForm] = useState({
    nombre: usuario?.nombre || '',
    email: usuario?.email || '',
    password: '',
    rolId: usuario?.rolId || ALMACENERO,
    departamento: usuario?.departamento || '',
    turno: usuario?.turno || '',
    areaAlmacen: usuario?.areaAlmacen || '',
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const esAdmin = Number(form.rolId) === ADMIN

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Correo inválido'
    if (!editando || form.password) {
      if (form.password.length < 8 || form.password.length > 72) e.password = 'Debe tener entre 8 y 72 caracteres'
    }
    return e
  }

  const submit = async (ev) => {
    ev.preventDefault()
    const e = validar()
    setErrors(e)
    if (Object.keys(e).length) return
    // Solo se envían los campos propios del rol
    const body = { nombre: form.nombre.trim(), email: form.email.trim() }
    if (form.password) body.password = form.password
    if (esAdmin) body.departamento = form.departamento.trim() || null
    else { body.turno = form.turno.trim() || null; body.areaAlmacen = form.areaAlmacen.trim() || null }
    setBusy(true)
    try {
      if (editando) await usuariosApi.actualizar(usuario.id, body)
      else await usuariosApi.crear({ ...body, rolId: Number(form.rolId) })
      toast.success('Usuario guardado')
      onSaved()
    } catch (err) {
      if (err.fields) setErrors(err.fields)
      else toast.error(err.message)
    } finally { setBusy(false) }
  }

  return (
    <Modal title={editando ? 'Editar usuario' : 'Nuevo usuario'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <Field label="Nombre" error={errors.nombre}><input autoFocus value={form.nombre} onChange={set('nombre')} /></Field>
        <Field label="Correo electrónico" error={errors.email}><input type="email" value={form.email} onChange={set('email')} /></Field>
        <Field label={editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'} error={errors.password}>
          <input type="password" autoComplete="new-password" value={form.password} onChange={set('password')} />
        </Field>
        <Field label="Rol" error={errors.rolId}>
          <select value={form.rolId} onChange={set('rolId')} disabled={editando}>
            <option value={ADMIN}>Administrador</option>
            <option value={ALMACENERO}>Almacenero</option>
          </select>
        </Field>
        {esAdmin ? (
          <Field label="Departamento" error={errors.departamento}><input value={form.departamento} onChange={set('departamento')} /></Field>
        ) : (
          <div className="form-row">
            <Field label="Turno" error={errors.turno}><input value={form.turno} onChange={set('turno')} placeholder="Mañana, Tarde..." /></Field>
            <Field label="Área de almacén" error={errors.areaAlmacen}><input value={form.areaAlmacen} onChange={set('areaAlmacen')} /></Field>
          </div>
        )}
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Usuarios() {
  const { user } = useAuth()
  const toast = useToast()
  const { data, loading, error, reload } = useApi(usuariosApi.listar, [])
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const eliminar = async () => {
    try {
      await usuariosApi.eliminar(deleting.id)
      toast.success('Usuario eliminado')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
    setDeleting(null)
  }

  return (
    <>
      <div className="page-head">
        <h1>Usuarios</h1>
        <button className="btn btn-primary" onClick={() => setEditing({})}>+ Nuevo usuario</button>
      </div>
      <Estado loading={loading} error={error} onRetry={reload} empty={!data.length} emptyText="No hay usuarios." />
      {!loading && !error && data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Detalle</th><th>Registro</th><th></th></tr></thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.rolId === ADMIN ? 'badge-info' : 'badge-ok'}`}>{u.rolNombre}</span></td>
                  <td>{u.rolId === ADMIN ? u.departamento || '—' : [u.turno, u.areaAlmacen].filter(Boolean).join(' · ') || '—'}</td>
                  <td>{fecha(u.fechaRegistro)}</td>
                  <td className="actions">
                    <button className="btn btn-sm" onClick={() => setEditing(u)}>Editar</button>
                    <button className="btn btn-sm btn-danger" disabled={u.id === user.id}
                      title={u.id === user.id ? 'No puedes eliminar tu propio usuario' : ''} onClick={() => setDeleting(u)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <UsuarioForm usuario={editing.id ? editing : null} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload() }} />
      )}
      {deleting && (
        <ConfirmModal message={`¿Eliminar al usuario "${deleting.nombre}"?`} onConfirm={eliminar} onClose={() => setDeleting(null)} />
      )}
    </>
  )
}
