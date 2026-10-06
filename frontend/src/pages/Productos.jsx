import { useCallback, useMemo, useState } from 'react'
import { categoriasApi } from '../api/categorias'
import { productosApi } from '../api/productos'
import { useAuth } from '../auth/AuthContext'
import ConfirmModal from '../components/ConfirmModal'
import Estado from '../components/Estado'
import Field from '../components/Field'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { money } from '../format'
import { useApi } from '../useApi'

function ProductoForm({ producto, categorias, onSaved, onClose }) {
  const toast = useToast()
  const [form, setForm] = useState({
    nombre: producto?.nombre || '',
    precioReferencial: producto?.precioReferencial ?? '',
    stockMinimo: producto?.stockMinimo ?? 0,
    categoriaId: producto?.categoriaId ?? '',
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    else if (form.nombre.length > 100) e.nombre = 'Máximo 100 caracteres'
    if (!(Number(form.precioReferencial) > 0)) e.precioReferencial = 'Debe ser mayor a 0'
    if (form.stockMinimo === '' || Number(form.stockMinimo) < 0) e.stockMinimo = 'Debe ser 0 o más'
    if (!form.categoriaId) e.categoriaId = 'Selecciona una categoría'
    return e
  }

  const submit = async (ev) => {
    ev.preventDefault()
    const e = validar()
    setErrors(e)
    if (Object.keys(e).length) return
    const body = {
      nombre: form.nombre.trim(),
      precioReferencial: Number(form.precioReferencial),
      stockMinimo: Number(form.stockMinimo),
      categoriaId: Number(form.categoriaId),
    }
    setBusy(true)
    try {
      if (producto) await productosApi.actualizar(producto.id, body)
      else await productosApi.crear(body)
      toast.success('Producto guardado')
      onSaved()
    } catch (err) {
      if (err.fields) setErrors(err.fields)
      else toast.error(err.message)
    } finally { setBusy(false) }
  }

  return (
    <Modal title={producto ? 'Editar producto' : 'Nuevo producto'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <Field label="Nombre" error={errors.nombre}>
          <input autoFocus value={form.nombre} onChange={set('nombre')} />
        </Field>
        <Field label="Categoría" error={errors.categoriaId}>
          <select value={form.categoriaId} onChange={set('categoriaId')}>
            <option value="">Selecciona...</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </Field>
        <div className="form-row">
          <Field label="Precio referencial (S/)" error={errors.precioReferencial}>
            <input type="number" step="0.01" min="0" value={form.precioReferencial} onChange={set('precioReferencial')} />
          </Field>
          <Field label="Stock mínimo" error={errors.stockMinimo}>
            <input type="number" min="0" step="1" value={form.stockMinimo} onChange={set('stockMinimo')} />
          </Field>
        </div>
        {producto && <p className="muted">Stock actual: {producto.stock} (se actualiza con los movimientos)</p>}
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Productos() {
  const { isAdmin } = useAuth()
  const toast = useToast()
  const prods = useApi(productosApi.listar, [])
  const cats = useApi(categoriasApi.listar, [])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase()
    return prods.data.filter((p) =>
      (!t || p.nombre.toLowerCase().includes(t)) && (!cat || String(p.categoriaId) === cat))
  }, [prods.data, q, cat])

  const eliminar = useCallback(async () => {
    try {
      await productosApi.eliminar(deleting.id)
      toast.success('Producto eliminado')
      prods.reload()
    } catch (err) {
      toast.error(err.message)
    }
    setDeleting(null)
  }, [deleting, prods, toast])

  return (
    <>
      <div className="page-head">
        <h1>Productos</h1>
        {isAdmin && <button className="btn btn-primary" onClick={() => setEditing({})}>+ Nuevo producto</button>}
      </div>
      <div className="toolbar">
        <input placeholder="Buscar por nombre..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {cats.data.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      <Estado loading={prods.loading} error={prods.error} onRetry={prods.reload}
        empty={!prods.data.length} emptyText="Aún no hay productos." />
      {!prods.loading && !prods.error && prods.data.length > 0 && (
        filtrados.length === 0 ? <Estado empty emptyText="Ningún producto coincide con la búsqueda." /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Producto</th><th>Categoría</th><th className="num">Precio ref.</th>
                  <th className="num">Stock</th><th className="num">Mínimo</th><th>Estado</th>{isAdmin && <th></th>}</tr>
              </thead>
              <tbody>
                {filtrados.map((p) => {
                  const bajo = p.stock <= p.stockMinimo
                  return (
                    <tr key={p.id} className={bajo ? 'row-danger' : ''}>
                      <td>{p.nombre}</td>
                      <td>{p.categoriaNombre}</td>
                      <td className="num">{money(p.precioReferencial)}</td>
                      <td className="num"><strong>{p.stock}</strong></td>
                      <td className="num">{p.stockMinimo}</td>
                      <td>{bajo ? <span className="badge badge-danger">Stock bajo</span> : <span className="badge badge-ok">OK</span>}</td>
                      {isAdmin && (
                        <td className="actions">
                          <button className="btn btn-sm" onClick={() => setEditing(p)}>Editar</button>
                          <button className="btn btn-sm btn-danger" onClick={() => setDeleting(p)}>Eliminar</button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}
      {editing && (
        <ProductoForm producto={editing.id ? editing : null} categorias={cats.data}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); prods.reload() }} />
      )}
      {deleting && (
        <ConfirmModal message={`¿Eliminar el producto "${deleting.nombre}"?`} onConfirm={eliminar} onClose={() => setDeleting(null)} />
      )}
    </>
  )
}
