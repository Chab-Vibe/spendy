export interface ReceiptAnalysis {
  amount: number
  description: string
  category: string
  storeName?: string
}

export async function analyzeReceipt(imageBase64: string): Promise<ReceiptAnalysis> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('NO_API_KEY')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
            },
            {
              type: 'text',
              text: `Elemezd ezt a blokkot/nyugtát. Válaszolj kizárólag JSON formátumban, semmi más szöveg:
{
  "amount": <végösszeg egész számban forintban>,
  "storeName": "<üzlet/szolgáltató neve>",
  "description": "<rövid leírás magyarul, max 40 karakter>",
  "category": "<egy a következők közül: élelmiszer, rezsi, lakás, közlekedés, egészség, szórakozás, ruha, egyéb>"
}
Ha nem látható egyértelműen a végösszeg, az amount legyen 0.`,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) throw new Error('API_ERROR')

  const data = await response.json()
  const text = (data.content[0].text as string).trim()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('PARSE_ERROR')

  return JSON.parse(jsonMatch[0]) as ReceiptAnalysis
}
