import { useState } from 'react'
import Modal from './Modal'

// onConfirm debe devolver una promesa; el modal muestra "Procesando..." mientras tanto
export default function ConfirmModal({ message, confirmText = 'Eliminar', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)
  const run = async () => {
    setBusy(true)
    try { await onConfirm() } finally { setBusy(false) }
  }
  return (
    <Modal title="Confirmar" onClose={onClose}>
      <p>{message}</p>
      <div className="form-actions">
        <button className="btn" onClick={onClose} disabled={busy}>Cancelar</button>
        <button className="btn btn-danger" onClick={run} disabled={busy}>
          {busy ? 'Procesando...' : confirmText}
        </button>
      </div>
    </Modal>
  )
}
