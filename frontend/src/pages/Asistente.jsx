import { useEffect, useRef, useState } from 'react'
import { consultar, USE_MOCK } from '../services/asistente'

const EJEMPLOS = [
  '¿Qué productos están por agotarse?',
  '¿Cuántas ventas hubo esta semana?',
  '¿Cuál es el producto con más stock?',
  '¿Qué compras a proveedor se registraron este mes?',
]

export default function Asistente() {
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const fin = useRef(null)

  useEffect(() => { fin.current?.scrollIntoView({ behavior: 'smooth' }) }, [mensajes, escribiendo])

  const enviar = async (pregunta) => {
    const p = pregunta.trim()
    if (!p || escribiendo) return
    setMensajes((m) => [...m, { rol: 'user', texto: p }])
    setTexto('')
    setEscribiendo(true)
    try {
      const r = await consultar(p)
      setMensajes((m) => [...m, { rol: 'bot', texto: r.respuesta, sql: r.sql }])
    } catch (err) {
      setMensajes((m) => [...m, { rol: 'bot', texto: `⚠️ ${err.message}`, error: true }])
    } finally {
      setEscribiendo(false)
    }
  }

  return (
    <>
      <h1>Asistente IA</h1>
      {USE_MOCK && <div className="alert alert-error" style={{ background: '#fef3c7', color: '#92400e' }}>
        Modo demostración: las respuestas son simuladas (el backend aún no tiene este endpoint).</div>}
      <div className="card chat">
        <div className="chat-log">
          {mensajes.length === 0 && <p className="muted">Hazme una pregunta sobre tu inventario en español.</p>}
          {mensajes.map((m, i) => (
            <div key={i} className={`msg ${m.rol === 'user' ? 'msg-user' : 'msg-bot'}`}>
              {m.texto}
              {m.sql && (
                <details>
                  <summary>Ver consulta</summary>
                  <pre>{m.sql}</pre>
                </details>
              )}
            </div>
          ))}
          {escribiendo && <div className="msg msg-bot muted">Escribiendo...</div>}
          <div ref={fin} />
        </div>
        <div className="chips">
          {EJEMPLOS.map((e) => <button key={e} className="chip" onClick={() => enviar(e)} disabled={escribiendo}>{e}</button>)}
        </div>
        <form className="chat-form" onSubmit={(e) => { e.preventDefault(); enviar(texto) }}>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe tu pregunta..." />
          <button className="btn btn-primary" disabled={escribiendo || !texto.trim()}>Enviar</button>
        </form>
      </div>
    </>
  )
}
