import { useState } from 'react'
import { categoriasApi } from '../api/categorias'
import ConfirmModal from '../components/ConfirmModal'
import Estado from '../components/Estado'
import Field from '../components/Field'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { useApi } from '../useApi'

function CategoriaForm({ categoria, onSaved, onClose }) {
  const toast = useToast()
  const [nombre, setNombre] = useState(categoria?.nombre || '')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const n = nombre.trim()
    if (!n) return setErrors({ nombre: 'El nombre es obligatorio' })
    if (n.length > 100) return setErrors({ nombre: 'Máximo 100 caracteres' })
    setBusy(true)
    try {
      if (categoria) await categoriasApi.actualizar(categoria.id, { nombre: n })
      else await categoriasApi.crear({ nombre: n })
      toast.success('Categoría guardada')
      onSaved()
    } catch (err) {
      if (err.fields) setErrors(err.fields)
      else toast.error(err.message)
    } finally { setBusy(false) }
  }

  return (
    <Modal title={categoria ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <Field label="Nombre" error={errors.nombre}>
          <input autoFocus value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Field>
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Categorias() {
  const toast = useToast()
  const { data, loading, error, reload } = useApi(categoriasApi.listar, [])
  const [editing, setEditing] = useState(null) // null | {} (nueva) | categoría
  const [deleting, setDeleting] = useState(null)

  const eliminar = async () => {
    try {
      await categoriasApi.eliminar(deleting.id)
      toast.success('Categoría eliminada')
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(err.message) // p. ej. 409 categoría con productos
      setDeleting(null)
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Categorías</h1>
        <button className="btn btn-primary" onClick={() => setEditing({})}>+ Nueva categoría</button>
      </div>
      <Estado loading={loading} error={error} empty={!data.length} emptyText="Aún no hay categorías." onRetry={reload} />
      {!loading && !error && data.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nombre</th><th></th></tr></thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td className="actions">
                    <button className="btn btn-sm" onClick={() => setEditing(c)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => setDeleting(c)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <CategoriaForm categoria={editing.id ? editing : null} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload() }} />
      )}
      {deleting && (
        <ConfirmModal message={`¿Eliminar la categoría "${deleting.nombre}"?`} onConfirm={eliminar} onClose={() => setDeleting(null)} />
      )}
    </>
  )
}
