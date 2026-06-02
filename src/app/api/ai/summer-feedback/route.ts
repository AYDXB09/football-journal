import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { technical_skills, physical_skills, watch_skills, big_goal, september_self_image, min_sessions_per_week } = body

    const techText = (technical_skills as { skill: string; freq: number }[])?.filter(s => s.skill).map(s => `${s.skill} (${s.freq}x/week)`).join(', ') || 'none'
    const physText = (physical_skills as { skill: string; freq: number }[])?.filter(s => s.skill).map(s => `${s.skill} (${s.freq}x/week)`).join(', ') || 'none'
    const watchText = (watch_skills as { skill: string; freq: number }[])?.filter(s => s.skill).map(s => `${s.skill} (${s.freq}x/week)`).join(', ') || 'none'

    const prompt = `You are a football development coach reviewing a young player's summer training plan. Be honest, specific, and constructive. The player has high football IQ.

Summer plan:
- Sessions per week committed: ${min_sessions_per_week}
- Technical work: ${techText}
- Physical work: ${physText}
- Study/watch: ${watchText}
- Big summer goal: ${big_goal || 'not specified'}
- September vision: ${september_self_image || 'not specified'}

Give an honest assessment of this plan in 3-4 sentences — what's strong about it, what might be missing or imbalanced, and one concrete suggestion to make it more effective. Do not use bullet points — just flowing coach voice.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 350,
      messages: [{ role: 'user', content: prompt }],
    })

    const feedback = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('AI summer feedback error:', error)
    return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 })
  }
}
