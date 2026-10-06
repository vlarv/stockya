import { Fragment, useState } from 'react'
import { movimientosApi, tiposMovimientoApi } from '../api/movimientos'
import { productosApi } from '../api/productos'
import ConfirmModal from '../components/ConfirmModal'
import Estado from '../components/Estado'
import Field from '../components/Field'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { fecha, money } from '../format'
import { useApi } from '../useApi'

const LINEA_VACIA = { productoId: '', cantidad: '', costoUnitario: '' }

function NuevoMovimiento({ tipos, productos, onSaved, onClose }) {
  const toast = useToast()
  const [form, setForm] = useState({ tipoMovimientoId: '', referenciaExterna: '', observaciones: '' })
  const [lineas, setLineas] = useState([{ ...LINEA_VACIA }])
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const tipo = tipos.find((t) => String(t.id) === String(form.tipoMovimientoId))
  const setLinea = (i, k, v) => setLineas(lineas.map((l, j) => (j === i ? { ...l, [k]: v } : l)))
  const quitar = (i) => setLineas(lineas.filter((_, j) => j !== i))

  const validar = () => {
    const e = {}
    if (!form.tipoMovimientoId) e.tipoMovimientoId = 'Selecciona un tipo'
    if (form.referenciaExterna.length > 100) e.referenciaExterna = 'Máximo 100 caracteres'
    lineas.forEach((l, i) => {
      if (!l.productoId) e[`l${i}.productoId`] = 'Elige un producto'
      if (!(Number(l.cantidad) > 0)) e[`l${i}.cantidad`] = 'Mayor a 0'
      if (l.costoUnitario === '' || Number(l.costoUnitario) < 0) e[`l${i}.costoUnitario`] = '0 o más'
    })
    return e
  }

  const submit = async (ev) => {
    ev.preventDefault()
    const e = validar()
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    try {
      await movimientosApi.crear({
        tipoMovimientoId: Number(form.tipoMovimientoId),
        referenciaExterna: form.referenciaExterna.trim() || null,
        observaciones: form.observaciones.trim() || null,
        detalles: lineas.map((l) => ({
          productoId: Number(l.productoId), cantidad: Number(l.cantidad), costoUnitario: Number(l.costoUnitario),
        })),
      })
      toast.success('Movimiento registrado')
      onSaved()
    } catch (err) {
      if (err.fields) setErrors(err.fields)
      toast.error(err.message) // incluye 409 de stock insuficiente
    } finally { setBusy(false) }
  }

  return (
    <Modal title="Nuevo movimiento" onClose={onClose} wide>
      <form onSubmit={submit} noValidate>
        <div className="form-row">
          <Field label="Tipo de movimiento" error={errors.tipoMovimientoId}>
            <select value={form.tipoMovimientoId} onChange={(e) => setForm({ ...form, tipoMovimientoId: e.target.value })}>
              <option value="">Selecciona...</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre} ({t.multiplicador > 0 ? 'suma' : 'resta'})</option>
              ))}
            </select>
          </Field>
          <Field label="Referencia (opcional)" error={errors.referenciaExterna}>
            <input value={form.referenciaExterna} onChange={(e) => setForm({ ...form, referenciaExterna: e.target.value })}
              placeholder="N.° de boleta, guía, etc." />
          </Field>
        </div>
        {tipo && (
          <p>
            Este movimiento <span className={`badge ${tipo.multiplicador > 0 ? 'badge-ok' : 'badge-danger'}`}>
              {tipo.multiplicador > 0 ? '＋ suma stock' : '－ resta stock'}</span>
            {tipo.descripcion && <span className="muted"> · {tipo.descripcion}</span>}
          </p>
        )}
        <Field label="Observaciones (opcional)" error={errors.observaciones}>
          <textarea rows={2} value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
        </Field>

        <h4>Productos</h4>
        {errors.detalles && <div className="alert alert-error">{errors.detalles}</div>}
        {lineas.map((l, i) => {
          const prod = productos.find((p) => String(p.id) === String(l.productoId))
          return (
            <div className="linea" key={i}>
              <Field label={i === 0 ? 'Producto' : ''} error={errors[`l${i}.productoId`] || errors[`detalles[${i}].productoId`]}>
                <select value={l.productoId} onChange={(e) => setLinea(i, 'productoId', e.target.value)}>
                  <option value="">Selecciona...</option>
                  {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </Field>
              <Field label={i === 0 ? 'Cantidad' : ''} error={errors[`l${i}.cantidad`] || errors[`detalles[${i}].cantidad`]}>
                <input type="number" min="1" step="1" value={l.cantidad} onChange={(e) => setLinea(i, 'cantidad', e.target.value)} />
              </Field>
              <Field label={i === 0 ? 'Costo unit. (S/)' : ''} error={errors[`l${i}.costoUnitario`] || errors[`detalles[${i}].costoUnitario`]}>
                <input type="number" min="0" step="0.01" value={l.costoUnitario} onChange={(e) => setLinea(i, 'costoUnitario', e.target.value)} />
              </Field>
              <button type="button" className="btn btn-sm" style={{ marginTop: i === 0 ? '1.6rem' : '.3rem' }}
                disabled={lineas.length === 1} onClick={() => quitar(i)} aria-label="Quitar línea">✕</button>
              {prod && <div className="hint">Stock actual de {prod.nombre}: <strong>{prod.stock}</strong></div>}
            </div>
          )
        })}
        <button type="button" className="btn btn-sm" onClick={() => setLineas([...lineas, { ...LINEA_VACIA }])}>+ Agregar producto</button>

        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Guardando...' : 'Registrar movimiento'}</button>
        </div>
      </form>
    </Modal>
  )
}

function EditarMovimiento({ mov, onSaved, onClose }) {
  const toast = useToast()
  const [form, setForm] = useState({ referenciaExterna: mov.referenciaExterna || '', observaciones: mov.observaciones || '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (form.referenciaExterna.length > 100) return setErrors({ referenciaExterna: 'Máximo 100 caracteres' })
    setBusy(true)
    try {
      await movimientosApi.actualizar(mov.id, {
        referenciaExterna: form.referenciaExterna.trim() || null,
        observaciones: form.observaciones.trim() || null,
      })
      toast.success('Movimiento actualizado')
      onSaved()
    } catch (err) {
      if (err.fields) setErrors(err.fields)
      else toast.error(err.message)
    } finally { setBusy(false) }
  }

  return (
    <Modal title={`Editar movimiento #${mov.id}`} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <p className="muted">Solo se pueden editar la referencia y las observaciones.</p>
        <Field label="Referencia" error={errors.referenciaExterna}>
          <input value={form.referenciaExterna} onChange={(e) => setForm({ ...form, referenciaExterna: e.target.value })} />
        </Field>
        <Field label="Observaciones" error={errors.observaciones}>
          <textarea rows={3} value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
        </Field>
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Movimientos() {
  const toast = useToast()
  const movs = useApi(movimientosApi.listar, [])
  const tipos = useApi(tiposMovimientoApi.listar, [])
  const prods = useApi(productosApi.listar, [])
  const [abierto, setAbierto] = useState(null)
  const [nuevo, setNuevo] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const recargar = () => { movs.reload(); prods.reload() }

  const eliminar = async () => {
    try {
      await movimientosApi.eliminar(deleting.id)
      toast.success('Movimiento eliminado y stock revertido')
      recargar()
    } catch (err) {
      toast.error(err.message) // 409 si dejaría stock negativo
    }
    setDeleting(null)
  }

  const lista = [...movs.data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  const tipoDe = (m) => tipos.data.find((t) => t.id === m.tipoMovimientoId)

  return (
    <>
      <div className="page-head">
        <h1>Movimientos</h1>
        <button className="btn btn-primary" onClick={() => setNuevo(true)} disabled={tipos.loading || prods.loading}>
          + Nuevo movimiento
        </button>
      </div>
      <Estado loading={movs.loading} error={movs.error} onRetry={movs.reload}
        empty={!lista.length} emptyText="Aún no hay movimientos." />
      {!movs.loading && !movs.error && lista.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Fecha</th><th>Tipo</th><th>Responsable</th><th>Referencia</th><th className="num">Ítems</th><th></th></tr>
            </thead>
            <tbody>
              {lista.map((m) => {
                const t = tipoDe(m)
                return (
                  <Fragment key={m.id}>
                    <tr>
                      <td>{fecha(m.fecha)}</td>
                      <td>
                        {t && <span className={`badge ${t.multiplicador > 0 ? 'badge-ok' : 'badge-danger'}`}>{t.multiplicador > 0 ? '＋' : '－'}</span>} {m.tipoMovimientoNombre}
                      </td>
                      <td>{m.responsableNombre}</td>
                      <td>{m.referenciaExterna || '—'}</td>
                      <td className="num">{m.detalles.length}</td>
                      <td className="actions">
                        <button className="btn btn-sm" onClick={() => setAbierto(abierto === m.id ? null : m.id)}>
                          {abierto === m.id ? 'Ocultar' : 'Detalle'}
                        </button>
                        <button className="btn btn-sm" onClick={() => setEditing(m)}>Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleting(m)}>Eliminar</button>
                      </td>
                    </tr>
                    {abierto === m.id && (
                      <tr className="detalle-row">
                        <td colSpan={6}>
                          {m.observaciones && <p><strong>Observaciones:</strong> {m.observaciones}</p>}
                          <table>
                            <thead><tr><th>Producto</th><th className="num">Cantidad</th><th className="num">Costo unit.</th><th className="num">Subtotal</th></tr></thead>
                            <tbody>
                              {m.detalles.map((d) => (
                                <tr key={d.id}>
                                  <td>{d.productoNombre}</td>
                                  <td className="num">{d.cantidad}</td>
                                  <td className="num">{money(d.costoUnitario)}</td>
                                  <td className="num">{money(d.cantidad * d.costoUnitario)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {nuevo && (
        <NuevoMovimiento tipos={tipos.data} productos={prods.data} onClose={() => setNuevo(false)}
          onSaved={() => { setNuevo(false); recargar() }} />
      )}
      {editing && <EditarMovimiento mov={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); movs.reload() }} />}
      {deleting && (
        <ConfirmModal message={`¿Eliminar el movimiento #${deleting.id}? Se revertirá el stock de sus productos.`}
          onConfirm={eliminar} onClose={() => setDeleting(null)} />
      )}
    </>
  )
}
