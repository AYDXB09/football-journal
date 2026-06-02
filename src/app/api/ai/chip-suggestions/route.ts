import { NextResponse } from 'next/server'
import { callGemini } from '@/lib/utils/gemini'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, context } = body

    let prompt: string
    let maxTokens: number

    if (type === 'match') {
      const { opponent, result, goals_for, goals_against, position, mood } = context
      prompt = `You are a football development assistant. Generate contextual chip suggestions for a young player's post-match reflection form.

Match context:
- Opponent: ${opponent || 'unknown'}
- Result: ${result || 'unknown'} (${goals_for ?? '?'}-${goals_against ?? '?'})
- Position: ${position || 'not specified'}
- Mood after match: ${mood || 'not specified'}

Return ONLY valid JSON — no markdown, no explanation, just the JSON object:
{
  "went_well": ["chip1", "chip2", "chip3", "chip4", "chip5", "chip6", "chip7", "chip8", "chip9", "chip10"],
  "improve_next": ["chip1", "chip2", "chip3", "chip4", "chip5", "chip6", "chip7", "chip8", "chip9", "chip10"],
  "key_moment": ["chip1", "chip2", "chip3", "chip4", "chip5", "chip6", "chip7", "chip8"],
  "coach_feedback": ["chip1", "chip2", "chip3", "chip4", "chip5", "chip6", "chip7", "chip8", "chip9", "chip10"]
}

Rules:
- Each chip is 2–5 words, lowercase, football-specific
- went_well: positive actions relevant to the position (${position || 'general'})
- improve_next: areas to work on — weight towards defensive/mental if it was a loss
- key_moment: types of moments that happen in matches (neutral, not outcome-specific)
- coach_feedback: short phrases a coach might say to this position
- Use proper football terminology throughout`
      maxTokens = 600

    } else if (type === 'training') {
      const { session_type, duration, coach_led } = context
      prompt = `You are a football development assistant. Generate contextual chip suggestions for a player's training session log.

Session context:
- Type: ${session_type || 'general'}
- Duration: ${duration || 60} minutes
- Coach led: ${coach_led ? 'yes' : 'no — solo session'}

Return ONLY valid JSON — no markdown, no explanation:
{
  "focus_areas": ["chip1", "chip2", "chip3", "chip4", "chip5", "chip6", "chip7", "chip8", "chip9", "chip10", "chip11", "chip12"],
  "reflection_notes": ["chip1", "chip2", "chip3", "chip4", "chip5", "chip6", "chip7", "chip8", "chip9", "chip10"]
}

Rules:
- focus_areas: specific drills, techniques, or topics for ${session_type} sessions (2–4 words each)
- reflection_notes: short phrases about how the session felt or what was learned (3–6 words)
- All lowercase, football-specific, no full sentences`
      maxTokens = 400

    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const raw = await callGemini(prompt, maxTokens)

    // Strip markdown code fences if Gemini wraps the JSON
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const chips = JSON.parse(cleaned)
    return NextResponse.json({ chips })

  } catch (error) {
    console.error('Chip suggestions error:', error)
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
