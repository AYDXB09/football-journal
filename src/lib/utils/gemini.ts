/**
 * Shared Gemini helper — uses Google's OpenAI-compatible endpoint.
 * No extra SDK needed. Set GEMINI_API_KEY in .env.local / Vercel env vars.
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai'
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

export async function callGemini(prompt: string, maxTokens = 500): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const res = await fetch(`${GEMINI_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}
