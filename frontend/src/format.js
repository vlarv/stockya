const soles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })
export const money = (n) => soles.format(Number(n) || 0)

export const fecha = (iso) =>
  iso ? new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '—'
