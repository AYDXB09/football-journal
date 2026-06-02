import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { opponent, result, position, overall_rating, went_well, improve_next, key_moment, coach_feedback, ratings } = body

    const ratingsText = ratings ? Object.entries(ratings).map(([k, v]) => `${k}: ${v}/10`).join(', ') : ''

    const prompt = `You are a football development coach giving feedback to a young player after a match. Your tone is growth-mindset, football-literate, warm but honest. The player has high football IQ — use proper football terminology, not generic youth sport language.

Match summary:
- Opponent: ${opponent}
- Result: ${result}
- Position played: ${position || 'not specified'}
- Overall rating: ${overall_rating}/10
- Performance ratings: ${ratingsText}

Player reflection:
- What went well: ${went_well || 'not provided'}
- What to improve: ${improve_next || 'not provided'}
- Key moment: ${key_moment || 'not provided'}
- Coach feedback received: ${coach_feedback || 'not provided'}

Give 3-4 sentences of coach-voice feedback. Be specific to what they shared. Acknowledge what went well, address the improvement area, and leave them with something concrete to work on. Do not use bullet points or headers — just flowing coach voice.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    const feedback = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('AI match feedback error:', error)
    return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 })
  }
}
