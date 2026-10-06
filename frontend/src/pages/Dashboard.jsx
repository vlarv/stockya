import { useCallback } from 'react'
import { movimientosApi } from '../api/movimientos'
import { productosApi } from '../api/productos'
import Estado from '../components/Estado'
import { useApi } from '../useApi'

export default function Dashboard() {
  const cargar = useCallback(async () => {
    const [productos, bajos, movimientos] = await Promise.all([
      productosApi.listar(), productosApi.stockBajo(), movimientosApi.listar(),
    ])
    return { productos, bajos, movimientos }
  }, [])
  const { data, loading, error, reload } = useApi(cargar)

  return (
    <>
      <h1>Dashboard</h1>
      <Estado loading={loading} error={error} onRetry={reload} />
      {data && (
        <>
          <div className="cards">
            <div className="card"><div className="muted">Total de productos</div><div className="stat">{data.productos.length}</div></div>
            <div className="card"><div className="muted">Productos con stock bajo</div>
              <div className={`stat ${data.bajos.length ? 'stat-danger' : ''}`}>{data.bajos.length}</div></div>
            <div className="card"><div className="muted">Total de movimientos</div><div className="stat">{data.movimientos.length}</div></div>
          </div>
          <h2>Alertas de stock bajo</h2>
          {data.bajos.length === 0 ? (
            <Estado empty emptyText="✅ Todo en orden: ningún producto está por debajo de su stock mínimo." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Producto</th><th>Categoría</th><th className="num">Stock</th><th className="num">Mínimo</th></tr></thead>
                <tbody>
                  {data.bajos.map((p) => (
                    <tr key={p.id} className={p.stock === 0 ? 'row-danger' : 'row-warn'}>
                      <td>{p.nombre}</td>
                      <td>{p.categoriaNombre}</td>
                      <td className="num"><span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warn'}`}>{p.stock}</span></td>
                      <td className="num">{p.stockMinimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}
