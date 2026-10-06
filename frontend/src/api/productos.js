import { crud, request } from './client'

export const productosApi = {
  ...crud('/productos'),
  stockBajo: () => request('/productos/stock-bajo'),
}
