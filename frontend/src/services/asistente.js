import { request } from '../api/client'

// Mientras el backend no tenga POST /asistente/consultar, deja esto en true.
export const USE_MOCK = true

const mock = async (pregunta) => {
  await new Promise((r) => setTimeout(r, 1200))
  if (/error/i.test(pregunta)) throw new Error('Error simulado del asistente')
  return {
    respuesta: `(Respuesta simulada) Recibí tu pregunta: "${pregunta}". Cuando el backend esté listo, aquí verás la respuesta real en lenguaje natural.`,
    sql: "SELECT nombre, stock, stock_minimo\nFROM producto\nWHERE stock <= stock_minimo\nORDER BY stock;",
  }
}

// Devuelve { respuesta, sql? }
export const consultar = (pregunta) =>
  USE_MOCK ? mock(pregunta) : request('/asistente/consultar', { method: 'POST', body: { pregunta } })
