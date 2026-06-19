export interface ReceiptLineItem {
  amount: number
  category: string
  description: string
}

export interface ReceiptAnalysis {
  storeName?: string
  lineItems: ReceiptLineItem[]
  totalAmount: number
}

export async function analyzeReceipt(imageBase64: string, mimeType = 'image/jpeg'): Promise<ReceiptAnalysis> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('NO_API_KEY')

  let response: Response
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: imageBase64 },
            },
            {
              type: 'text',
              text: `Elemezd ezt a blokkot/számla-fotót. NE listázd az egyes tételeket — helyette összegezd a végösszeget kategóriánként.
Pl. ha egy 10000 Ft-os Lidl blokkon 7000 Ft élelmiszer és 3000 Ft tisztítószer van, akkor:
lineItems: [{ category: "élelmiszer", amount: 7000 }, { category: "egyéb", amount: 3000 }]

Válaszolj kizárólag JSON formátumban, más szöveg nélkül:
{
  "storeName": "bolt neve ha látható, egyébként null",
  "lineItems": [
    { "category": "élelmiszer", "amount": 7000, "description": "Élelmiszer" },
    { "category": "egyéb", "amount": 3000, "description": "Tisztítószer, egyéb" }
  ],
  "totalAmount": 10000
}
Elérhető kategóriák (csak ezek egyikét használd): élelmiszer, rezsi, lakás, közlekedés, egészség, szórakozás, ruha, egyéb.
Az amount értékek egész számok forintban. Csak azokat a kategóriákat szerepeltesd, amelyekre ténylegesen van tétel.`,
            },
          ],
        },
      ],
    }),
    })
  } catch (e) {
    throw new Error(`Hálózati hiba: ${(e as Error).message}`)
  }

  if (!response.ok) {
    let detail = ''
    try {
      const errBody = await response.json()
      detail = errBody?.error?.message ?? JSON.stringify(errBody)
    } catch {
      detail = await response.text().catch(() => '')
    }
    throw new Error(`API ${response.status}: ${detail.slice(0, 200)}`)
  }

  const data = await response.json()
  const text = (data?.content?.[0]?.text as string | undefined)?.trim()
  if (!text) throw new Error('Üres válasz az API-tól')

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('PARSE_ERROR')

  return JSON.parse(jsonMatch[0]) as ReceiptAnalysis
}
