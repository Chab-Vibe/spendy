import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Diagnostic: catch and report the exact non-ISO-8859-1 header
;(function () {
  const orig = window.fetch
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    try {
      return orig.apply(window, [input, init] as Parameters<typeof fetch>)
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? ''
      if (msg.includes('ISO-8859-1') || msg.includes('headers')) {
        let info = 'header nem azonosítható'
        if (init?.headers && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
          const h = init.headers as Record<string, string>
          for (const [k, v] of Object.entries(h)) {
            if (typeof v === 'string') {
              for (let i = 0; i < v.length; i++) {
                const cp = v.charCodeAt(i)
                if (cp > 255) {
                  info = `"${k}" mező, ${i}. karakter: "${v[i]}" (U+${cp.toString(16).toUpperCase()}), érték-részlet: "${v.substring(0, 30)}"`
                  break
                }
              }
            }
          }
        }
        throw new Error(`[DEBUG] Fetch hiba — ${info}`)
      }
      throw e
    }
  }
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
