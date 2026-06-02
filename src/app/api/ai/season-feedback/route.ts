import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { proud, hardest_moment, new_skill, gap, coach_theme, letter_to_self, team_reflections } = body

    const teamsText = team_reflections ? Object.values(team_reflections as Record<string, { text: string; rating: number }>)
      .map((t: { text: string; rating: number }) => `Team reflection: ${t.text} (rated ${t.rating}/5 stars)`)
      .join('\n') : ''

    const prompt = `You are a football development coach writing an end-of-season message to a young player. Your tone is warm, honest, growth-mindset, and football-literate. This is a significant moment — the player has reflected deeply on their season.

Season review:
- What they're proud of: ${proud || 'not provided'}
- Hardest moment and learning: ${hardest_moment || 'not provided'}
- New skill developed: ${new_skill || 'not provided'}
- Their biggest gap: ${gap || 'not provided'}
- Recurring coach feedback: ${coach_theme || 'not provided'}
- Team reflections: ${teamsText || 'not provided'}
- Letter to themselves: ${letter_to_self ? letter_to_self.slice(0, 300) : 'not provided'}

Write a personalised end-of-season coach message — 4-5 sentences. Acknowledge specific things they mentioned, validate their honesty about the gap, and send them into the summer with clear direction. Do not use bullet points — just flowing coach voice.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const feedback = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('AI season feedback error:', error)
    return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 })
  }
}
