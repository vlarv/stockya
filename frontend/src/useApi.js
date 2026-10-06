import { useCallback, useEffect, useState } from 'react'

// Carga datos al montar y permite recargar. fn debe ser estable o se re-ejecuta en cada cambio.
export function useApi(fn, initial = null) {
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setData(await fn()) } catch (e) { setError(e.message) } finally { setLoading(false) }
  }, [fn])

  useEffect(() => { reload() }, [reload])
  return { data, loading, error, reload, setData }
}
