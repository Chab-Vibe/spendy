import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Diagnostic: catch and report the exact non-ISO-8859-1 header (sync + async)
;(function () {
  const orig = window.fetch

  function findBadHeader(init?: RequestInit): string {
    if (!init?.headers || typeof init.headers !== 'object') return 'no headers'
    const entries: [string, string][] = init.headers instanceof Headers
      ? (() => { const a: [string, string][] = []; (init.headers as Headers).forEach((v, k) => a.push([k, v])); return a })()
      : Object.entries(init.headers as Record<string, string>)
    for (const [k, v] of entries) {
      if (typeof v !== 'string') continue
      for (let i = 0; i < v.length; i++) {
        const cp = v.charCodeAt(i)
        if (cp > 127) {
          return `"${k}"[${i}]="${v[i]}"(U+${cp.toString(16).toUpperCase()}) val="${v.substring(0, 40)}"`
        }
      }
    }
    return `headers ok, url=${String(input).substring(0, 60)}`
  }

  // eslint-disable-next-line prefer-const
  let input: RequestInfo | URL

  window.fetch = function (inp: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).__fetchInput = inp
    input = inp
    let p: Promise<Response>
    try {
      p = orig.apply(window, [inp, init] as Parameters<typeof fetch>)
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? ''
      if (msg.includes('ISO-8859-1') || msg.includes('headers') || msg.includes('fetch')) {
        throw new Error(`[DEBUG-sync] ${findBadHeader(init)}`)
      }
      throw e
    }
    return p.catch((e: unknown) => {
      const msg = (e as Error)?.message ?? ''
      if (msg.includes('ISO-8859-1') || msg.includes('headers') || msg.includes('fetch')) {
        throw new Error(`[DEBUG-async] ${findBadHeader(init)}`)
      }
      throw e
    })
  }
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
