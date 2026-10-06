import { crud, request } from './client'

export const movimientosApi = crud('/movimientos')
export const tiposMovimientoApi = { listar: () => request('/tipos-movimiento') }
