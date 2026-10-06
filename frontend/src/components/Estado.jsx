// Estados de carga / vacío / error comunes a las pantallas
export default function Estado({ loading, error, empty, emptyText = 'No hay registros.', onRetry }) {
  if (loading) return <div className="estado">Cargando...</div>
  if (error) return (
    <div className="estado estado-error">
      {error} {onRetry && <button className="btn btn-sm" onClick={onRetry}>Reintentar</button>}
    </div>
  )
  if (empty) return <div className="estado">{emptyText}</div>
  return null
}
