'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GoalState {
  ballX: number | null
  ballY: number | null
  keeperXPct: number
  keeperPosture: 'standing' | 'jumping' | 'sliding'
  shotX: number | null
  shotY: number | null
  goalType: 'regular' | 'penalty' | 'freekick' | null
  bodyPart: string | null
  technique: string | null
  scoreUs: number | null
  scoreOpp: number | null
  period: string | null
  videoUrl: string
}

interface Props {
  goalCount: number
  format: '5v5' | '7v7' | '9v9' | '11v11'
  onChange: (goals: GoalState[]) => void
}

function makeDefault(): GoalState {
  return {
    ballX: null, ballY: null,
    keeperXPct: 0.5, keeperPosture: 'standing',
    shotX: null, shotY: null,
    goalType: null,
    bodyPart: null, technique: null,
    scoreUs: null, scoreOpp: null,
    period: null,
    videoUrl: '',
  }
}

// ─── SVG Math (ported from preview) ──────────────────────────────────────────
const NET_FORMATS: Record<string, { fw: number; fh: number; label: string }> = {
  '5v5':  { fw: 231,  fh: 77,  label: '3.66×1.22m' },
  '7v7':  { fw: 315,  fh: 126, label: '5×2m'        },
  '9v9':  { fw: 378,  fh: 132, label: '6×2.1m'      },
  '11v11':{ fw: 461,  fh: 154, label: '7.32×2.44m'  },
}
const PITCH_FORMATS: Record<string, { pitchW: number; goalW: number; penW: number; penH: number; sixW: number; sixH: number }> = {
  '5v5':  { pitchW: 37, goalW: 3.66, penW: 22,    penH: 7,    sixW: 8,    sixH: 3   },
  '7v7':  { pitchW: 46, goalW: 5,    penW: 28,    penH: 10,   sixW: 12,   sixH: 4   },
  '9v9':  { pitchW: 61, goalW: 6,    penW: 37,    penH: 13,   sixW: 16,   sixH: 5   },
  '11v11':{ pitchW: 68, goalW: 7.32, penW: 40.32, penH: 16.5, sixW: 18.32,sixH: 5.5 },
}

const PAD = 55, POSTW = 10, CROSSH = 8, GROUNDH = 14
const P_W = 300, P_H = 175, P_GL = 16

interface MergedDims {
  fw: number; fh: number; nx: number; ny: number; vw: number
  groundY: number; groundBarBot: number; netBotY: number; gap: number
  pitchScale: number; pitchOffY: number; pitchVisH: number; totalH: number
  goal2D_x1: number; goal2D_x2: number; goal2D_y1: number; goal2D_y2: number
  goalX1_orig: number; goalX2_orig: number; goalW_orig: number
  pf: typeof PITCH_FORMATS['7v7']; ppx: number
}

function getMergedDims(fmt: string): MergedDims {
  const nf = NET_FORMATS[fmt]
  const pf = PITCH_FORMATS[fmt]
  const fw = nf.fw, fh = nf.fh
  const nx = PAD
  const ny = CROSSH
  const vw = fw + PAD * 2
  const groundY      = ny + fh
  const groundBarBot = groundY + GROUNDH
  const goal2D_height = (fh / 63) * vw / pf.pitchW
  const gap           = Math.ceil(goal2D_height) + 6
  const netBotY      = groundBarBot + gap
  const pitchScale   = vw / P_W
  const pitchOffY    = netBotY - P_GL * pitchScale
  const pitchVisH    = (P_H - P_GL) * pitchScale
  const totalH       = Math.round(netBotY + pitchVisH)
  const ppx          = P_W / pf.pitchW
  const goalW_orig   = pf.goalW * ppx
  const goalX1_orig  = P_W / 2 - goalW_orig / 2
  const goalX2_orig  = P_W / 2 + goalW_orig / 2
  const goal2D_x1    = goalX1_orig * pitchScale
  const goal2D_x2    = goalX2_orig * pitchScale
  const goal2D_y2    = netBotY
  const goal2D_y1    = netBotY - goal2D_height
  return { fw, fh, nx, ny, vw, groundY, groundBarBot, netBotY, gap,
           pitchScale, pitchOffY, pitchVisH, totalH,
           goal2D_x1, goal2D_x2, goal2D_y1, goal2D_y2,
           goalX1_orig, goalX2_orig, goalW_orig, pf, ppx }
}

function deriveZone(x: number, y: number): string {
  return `${y < 1/3 ? 'Top' : y < 2/3 ? 'Mid' : 'Low'} ${x < 1/3 ? 'Left' : x < 2/3 ? 'Centre' : 'Right'}`
}

function keeperPosLabel(pct: number): string {
  if (pct < 0.3) return 'left'
  if (pct > 0.7) return 'right'
  return 'centre'
}

function getKeeperDir(g: GoalState): number {
  if (g.ballX == null) return 0
  const diff = g.ballX - g.keeperXPct
  if (diff > 0.06) return 1
  if (diff < -0.06) return -1
  return 0
}

function getKeeperX(D: MergedDims, keeperXPct: number): number {
  const margin = POSTW + 10
  return (D.nx - margin) + keeperXPct * (D.fw + margin * 2)
}

function pitchZoneLabel(x: number, y: number, fmt: string): string {
  const pf = PITCH_FORMATS[fmt]
  const ppx = P_W / pf.pitchW
  const cx = P_W / 2
  const penW = pf.penW * ppx, penH = pf.penH * ppx, sixH = pf.sixH * ppx
  const penX1 = cx - penW / 2, penX2 = cx + penW / 2
  const col = x < penX1 ? 'Left wing'
            : x > penX2 ? 'Right wing'
            : x < cx - penW / 6 ? 'Left channel'
            : x > cx + penW / 6 ? 'Right channel'
            : 'Centre'
  const depth = y - P_GL
  const row = depth < sixH      ? 'Goal area'
            : depth < penH      ? 'Penalty area'
            : depth < penH + 45 ? 'Edge of box'
            : 'Outside box'
  return `${col} · ${row}`
}

function keeperSVG(cx: number, baseY: number, h: number, g: GoalState): string {
  const hR = h * .11, bH = h * .38, bW = h * .18, lH = h * .32, col = '#4a8a5a'
  const dir = getKeeperDir(g)
  if (g.keeperPosture === 'standing') {
    const aY = baseY - lH - bH * .6, aSpan = h * .34
    const aSpanL = dir === 1 ? aSpan * .55 : dir === -1 ? aSpan * 1.15 : aSpan
    const aSpanR = dir === -1 ? aSpan * .55 : dir === 1 ? aSpan * 1.15 : aSpan
    const aYL = dir === -1 ? aY - h * .08 : aY
    const aYR = dir === 1  ? aY - h * .08 : aY
    return `<line stroke="${col}" stroke-width="${bW*.45}" stroke-linecap="round" x1="${cx-bW*.3}" y1="${baseY-lH}" x2="${cx-bW*.5}" y2="${baseY}"/>
      <line stroke="${col}" stroke-width="${bW*.45}" stroke-linecap="round" x1="${cx+bW*.3}" y1="${baseY-lH}" x2="${cx+bW*.5}" y2="${baseY}"/>
      <rect fill="${col}" x="${cx-bW/2}" y="${baseY-lH-bH}" width="${bW}" height="${bH}" rx="${bW*.3}"/>
      <line stroke="${col}" stroke-width="${bW*.4}" stroke-linecap="round" x1="${cx-bW/2}" y1="${aY}" x2="${cx-aSpanL}" y2="${aYL}"/>
      <line stroke="${col}" stroke-width="${bW*.4}" stroke-linecap="round" x1="${cx+bW/2}" y1="${aY}" x2="${cx+aSpanR}" y2="${aYR}"/>
      <circle fill="${col}" cx="${cx}" cy="${baseY-lH-bH-hR}" r="${hR}"/>`
  }
  if (g.keeperPosture === 'jumping') {
    const lift = h * .22, legBend = h * .14, bodyTop = baseY - lH - bH - lift
    const armTopL = dir === 1  ? bodyTop + h * .05 : bodyTop - h * .38
    const armTopR = dir === -1 ? bodyTop + h * .05 : bodyTop - h * .38
    const armSpanL = dir === 1  ? h * .06 : h * .13
    const armSpanR = dir === -1 ? h * .06 : h * .13
    return `<line stroke="${col}" stroke-width="${bW*.45}" stroke-linecap="round" x1="${cx-bW*.2}" y1="${baseY-lH-lift}" x2="${cx-bW*.5}" y2="${baseY-lH*.3-lift+legBend}"/>
      <line stroke="${col}" stroke-width="${bW*.45}" stroke-linecap="round" x1="${cx+bW*.2}" y1="${baseY-lH-lift}" x2="${cx+bW*.6}" y2="${baseY-lH*.3-lift+legBend}"/>
      <rect fill="${col}" x="${cx-bW/2}" y="${bodyTop}" width="${bW}" height="${bH}" rx="${bW*.3}"/>
      <line stroke="${col}" stroke-width="${bW*.4}" stroke-linecap="round" x1="${cx-bW*.3}" y1="${bodyTop+bH*.1}" x2="${cx-armSpanL}" y2="${armTopL}"/>
      <line stroke="${col}" stroke-width="${bW*.4}" stroke-linecap="round" x1="${cx+bW*.3}" y1="${bodyTop+bH*.1}" x2="${cx+armSpanR}" y2="${armTopR}"/>
      <circle fill="${col}" cx="${cx}" cy="${bodyTop-hR}" r="${hR}"/>`
  }
  if (g.keeperPosture === 'sliding') {
    const d = dir !== 0 ? dir : 1, bodyL = h * .55, bodyH = bW * .9, legL = h * .38, armR = h * .36
    const bx1 = cx + d * bodyL * .45, by1 = baseY - h * .28, bx2 = cx - d * bodyL * .55, by2 = baseY - h * .05
    return `<line stroke="${col}" stroke-width="${bW*.5}" stroke-linecap="round" x1="${bx2}" y1="${by2}" x2="${bx2-d*legL*.3}" y2="${by2-h*.04}"/>
      <line stroke="${col}" stroke-width="${bW*.5}" stroke-linecap="round" x1="${bx2}" y1="${by2}" x2="${bx2+d*legL*.15}" y2="${by2+h*.02}"/>
      <line stroke="${col}" stroke-width="${bW*.9}" stroke-linecap="round" x1="${bx2+d*bW*.4}" y1="${by2}" x2="${bx1-d*bW*.3}" y2="${by1}"/>
      <line stroke="${col}" stroke-width="${bW*.4}" stroke-linecap="round" x1="${bx1}" y1="${by1+h*.04}" x2="${bx1+d*armR}" y2="${by1+h*.08}"/>
      <line stroke="${col}" stroke-width="${bW*.4}" stroke-linecap="round" x1="${bx2+d*bW*.3}" y1="${by2-h*.08}" x2="${bx2-d*armR*.4}" y2="${by2-h*.18}"/>
      <circle fill="${col}" cx="${bx1+d*hR*.6}" cy="${by1-hR}" r="${hR}"/>`
  }
  return ''
}

function netLines(nx: number, ny: number, fw: number, fh: number): string {
  let s = ''
  for (let x = 0; x <= fw; x += 10) s += `<line stroke="#2d5238" stroke-width="0.6" opacity=".8" x1="${nx+x}" y1="${ny}" x2="${nx+x}" y2="${ny+fh}"/>`
  for (let y = 0; y <= fh; y += 8)  s += `<line stroke="#2d5238" stroke-width="0.6" opacity=".8" x1="${nx}" y1="${ny+y}" x2="${nx+fw}" y2="${ny+y}"/>`
  for (let x = -fh; x <= fw + fh; x += 16) s += `<line stroke="#2d5238" stroke-width="0.4" opacity=".22" x1="${nx+x}" y1="${ny}" x2="${nx+x+fh}" y2="${ny+fh}"/>`
  return s
}

function gridGuides(nx: number, ny: number, fw: number, fh: number, gridOn: boolean): string {
  const fs = Math.max(8, fw * .018)
  const L = [['Top Left','Top Centre','Top Right'],['Mid Left','Mid Centre','Mid Right'],['Low Left','Low Centre','Low Right']]
  let s = `<g id="gridGuides" style="display:${gridOn ? 'block' : 'none'}">`
  s += `<line stroke="rgba(232,255,71,.22)" stroke-width="1" stroke-dasharray="5,4" x1="${nx+fw/3}" y1="${ny}" x2="${nx+fw/3}" y2="${ny+fh}"/>`
  s += `<line stroke="rgba(232,255,71,.22)" stroke-width="1" stroke-dasharray="5,4" x1="${nx+fw*2/3}" y1="${ny}" x2="${nx+fw*2/3}" y2="${ny+fh}"/>`
  s += `<line stroke="rgba(232,255,71,.22)" stroke-width="1" stroke-dasharray="5,4" x1="${nx}" y1="${ny+fh/3}" x2="${nx+fw}" y2="${ny+fh/3}"/>`
  s += `<line stroke="rgba(232,255,71,.22)" stroke-width="1" stroke-dasharray="5,4" x1="${nx}" y1="${ny+fh*2/3}" x2="${nx+fw}" y2="${ny+fh*2/3}"/>`
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
    s += `<text font-family="DM Mono,monospace" font-size="${fs}" fill="rgba(232,255,71,.32)" text-anchor="middle"
      x="${nx+c*(fw/3)+fw/6}" y="${ny+r*(fh/3)+fh/6+fs*.4}">${L[r][c]}</text>`
  return s + '</g>'
}

function buildPitchElements(g: GoalState, fmt: string): string {
  const pf = PITCH_FORMATS[fmt]
  const ppx = P_W / pf.pitchW
  const cx = P_W / 2
  const gl = P_GL
  const lc = 'rgba(255,255,255,.6)', lw = 1.5, lcdim = 'rgba(255,255,255,.12)'
  const penW  = Math.round(pf.penW  * ppx), penH = Math.round(pf.penH * ppx)
  const sixW  = Math.round(pf.sixW  * ppx), sixH = Math.round(pf.sixH * ppx)
  const penX1 = cx - penW / 2, penX2 = cx + penW / 2
  const sixX1 = cx - sixW / 2
  const stripeW = Math.round(pf.pitchW / 4 * ppx)
  const keeperDotX = (cx - pf.goalW * ppx / 2) + g.keeperXPct * (pf.goalW * ppx)
  const keeperDotY = gl + 5
  const hasShot = g.shotX != null
  const adx = hasShot ? g.shotX! : -99
  const ady = hasShot ? g.shotY! : -99
  let stripes = ''
  for (let i = 0; i < 5; i++)
    stripes += `<rect x="${i*stripeW}" y="${gl}" width="${stripeW}" height="${P_H-gl}" fill="${i%2===0?'#0d1e13':'#0f2215'}"/>`
  return `${stripes}
    <line x1="0" y1="${gl}" x2="${P_W}" y2="${gl}" stroke="${lc}" stroke-width="${lw}"/>
    <line x1="0" y1="${gl}" x2="0" y2="${P_H}" stroke="${lc}" stroke-width="${lw}"/>
    <line x1="${P_W}" y1="${gl}" x2="${P_W}" y2="${P_H}" stroke="${lc}" stroke-width="${lw}"/>
    <line x1="0" y1="${P_H}" x2="${P_W}" y2="${P_H}" stroke="${lc}" stroke-width="${lw}"/>
    <rect x="${sixX1}" y="${gl}" width="${sixW}" height="${sixH}" fill="none" stroke="${lc}" stroke-width="1"/>
    <rect x="${penX1}" y="${gl}" width="${penW}" height="${penH}" fill="none" stroke="${lc}" stroke-width="${lw}"/>
    <line x1="0" y1="${gl+penH+45}" x2="${P_W}" y2="${gl+penH+45}" stroke="${lcdim}" stroke-width="1" stroke-dasharray="5,4"/>
    <line x1="${penX1}" y1="${gl}" x2="${penX1}" y2="${P_H}" stroke="${lcdim}" stroke-width="1"/>
    <line x1="${penX2}" y1="${gl}" x2="${penX2}" y2="${P_H}" stroke="${lcdim}" stroke-width="1"/>
    <text x="${penX1/2}" y="${P_H-6}" text-anchor="middle" font-family="DM Mono,monospace" font-size="8" fill="rgba(255,255,255,.22)">L WING</text>
    <text x="${cx}" y="${P_H-6}" text-anchor="middle" font-family="DM Mono,monospace" font-size="8" fill="rgba(255,255,255,.22)">CENTRE</text>
    <text x="${(penX2+P_W)/2}" y="${P_H-6}" text-anchor="middle" font-family="DM Mono,monospace" font-size="8" fill="rgba(255,255,255,.22)">R WING</text>
    ${hasShot ? `<circle cx="${adx}" cy="${ady}" r="4" fill="#e8ff47" stroke="#0f1f16" stroke-width="1.2"/>
      <circle cx="${adx}" cy="${ady}" r="1.6" fill="#0f1f16"/>` : ''}
    <circle id="pitchKeeperDot" cx="${keeperDotX}" cy="${keeperDotY}" r="1.8" fill="#4a8a5a" stroke="#0f1f16" stroke-width="0.6"/>`
}

function footballSVG(cx: number, cy: number, r: number, op: number): string {
  if (!op) return ''
  function penta(px: number, py: number, pr: number, rotDeg: number): string {
    return Array.from({ length: 5 }, (_, i) => {
      const a = (i * 72 + rotDeg) * Math.PI / 180
      return `${(px + pr * Math.cos(a)).toFixed(2)},${(py + pr * Math.sin(a)).toFixed(2)}`
    }).join(' ')
  }
  const dark = '#cc2222', light = '#4488dd'
  const cp = penta(cx, cy, r * 0.3, -90)
  const outer = Array.from({ length: 5 }, (_, i) => {
    const baseAngle = i * 72 - 90
    const a = baseAngle * Math.PI / 180
    const px = cx + r * 0.65 * Math.cos(a)
    const py = cy + r * 0.65 * Math.sin(a)
    const pts = penta(px, py, r * 0.23, baseAngle + 36)
    return `<polygon points="${pts}" fill="${dark}" stroke="${light}" stroke-width="${(r*0.04).toFixed(1)}" stroke-linejoin="round"/>`
  }).join('')
  const seams = Array.from({ length: 5 }, (_, i) => {
    const a1 = (i * 72 - 90) * Math.PI / 180
    const a2 = ((i + 1) * 72 - 90) * Math.PI / 180
    const mid = (a1 + a2) / 2
    const x1 = (cx + r * 0.3 * Math.cos(mid)).toFixed(1)
    const y1 = (cy + r * 0.3 * Math.sin(mid)).toFixed(1)
    const x2 = (cx + r * 0.65 * Math.cos((i * 72 + 36 - 90) * Math.PI / 180)).toFixed(1)
    const y2 = (cy + r * 0.65 * Math.sin((i * 72 + 36 - 90) * Math.PI / 180)).toFixed(1)
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${dark}" stroke-width="${(r*0.07).toFixed(1)}"/>`
  }).join('')
  return `<g opacity="${op}">
    <clipPath id="bclip"><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}"/></clipPath>
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${light}" stroke="${dark}" stroke-width="${(r*0.09).toFixed(1)}"/>
    <g clip-path="url(#bclip)">
      ${seams}
      ${outer}
      <polygon points="${cp}" fill="${dark}" stroke="${light}" stroke-width="${(r*0.04).toFixed(1)}" stroke-linejoin="round"/>
    </g>
    <ellipse cx="${(cx-r*.2).toFixed(1)}" cy="${(cy-r*.25).toFixed(1)}"
      rx="${(r*.21).toFixed(1)}" ry="${(r*.11).toFixed(1)}"
      transform="rotate(-35,${(cx-r*.2).toFixed(1)},${(cy-r*.25).toFixed(1)})"
      fill="rgba(255,255,255,.52)"/>
  </g>`
}

function buildMergedSVG(g: GoalState, fmt: string, overlaysOn: boolean): string {
  const D = getMergedDims(fmt)
  const { fw, fh, nx, ny, vw, groundY, netBotY, pitchScale, pitchOffY, totalH,
          goal2D_x1, goal2D_x2, goal2D_y1, goal2D_y2 } = D
  const kx     = getKeeperX(D, g.keeperXPct)
  const ballR  = Math.max(5, fw * 0.024) * 1.1
  const bx     = g.ballX != null ? nx + g.ballX * fw : -999
  const by     = g.ballY != null ? ny + g.ballY * fh : -999
  const op     = g.ballX != null ? 1 : 0

  return `<svg id="mergedSVG" viewBox="0 0 ${vw} ${totalH}" xmlns="http://www.w3.org/2000/svg" style="cursor:crosshair;touch-action:none">

  <!-- NET SECTION -->
  <rect fill="#0a1a10" x="${nx}" y="${ny}" width="${fw}" height="${fh}"/>
  <clipPath id="nc"><rect x="${nx}" y="${ny}" width="${fw}" height="${fh}"/></clipPath>
  <g clip-path="url(#nc)">${netLines(nx, ny, fw, fh)}</g>
  ${gridGuides(nx, ny, fw, fh, overlaysOn)}

  ${footballSVG(bx, by, ballR, op)}

  <!-- posts + crossbar -->
  <rect fill="#b8c4b8" x="${nx-POSTW}" y="${ny-CROSSH/2}" width="${POSTW}" height="${fh+CROSSH/2}" rx="2"/>
  <rect fill="#b8c4b8" x="${nx+fw}" y="${ny-CROSSH/2}" width="${POSTW}" height="${fh+CROSSH/2}" rx="2"/>
  <rect fill="#c4cec4" x="${nx-POSTW}" y="${ny-CROSSH}" width="${fw+POSTW*2}" height="${CROSSH}" rx="3"/>

  <!-- ground bar -->
  <rect fill="#1a3020" x="${nx-POSTW-4}" y="${groundY}" width="${fw+(POSTW+4)*2}" height="${GROUNDH}" rx="3"/>

  <!-- keeper -->
  <g id="keeperG">${keeperSVG(kx, groundY, fh*.68, g)}</g>

  <!-- keeper drag hint: inward arrows (overlays only) -->
  ${overlaysOn ? (() => {
    const ay = (groundY + GROUNDH * 0.45).toFixed(1)
    const ay3 = (groundY + GROUNDH * 0.45 - 3).toFixed(1)
    const ay3p = (groundY + GROUNDH * 0.45 + 3).toFixed(1)
    return `<line x1="${(kx-30).toFixed(1)}" y1="${ay}" x2="${(kx-11).toFixed(1)}" y2="${ay}" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
  <polygon points="${(kx-11).toFixed(1)},${ay3} ${(kx-4).toFixed(1)},${ay} ${(kx-11).toFixed(1)},${ay3p}" fill="rgba(255,255,255,.3)"/>
  <line x1="${(kx+30).toFixed(1)}" y1="${ay}" x2="${(kx+11).toFixed(1)}" y2="${ay}" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
  <polygon points="${(kx+11).toFixed(1)},${ay3} ${(kx+4).toFixed(1)},${ay} ${(kx+11).toFixed(1)},${ay3p}" fill="rgba(255,255,255,.3)"/>`
  })() : ''}

  <!-- 2D goal box -->
  <rect x="${goal2D_x1.toFixed(1)}" y="${goal2D_y1.toFixed(1)}"
    width="${(goal2D_x2-goal2D_x1).toFixed(1)}" height="${(goal2D_y2-goal2D_y1).toFixed(1)}"
    fill="rgba(8,16,10,.5)" stroke="rgba(255,255,255,.35)" stroke-width="0.6" rx="1"/>

  <!-- projection lines: base of net → pitch goal line (overlays only) -->
  ${overlaysOn ? `<line x1="${nx}" y1="${groundY}" x2="${goal2D_x1.toFixed(1)}" y2="${goal2D_y2.toFixed(1)}" stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="4,4"/>
  <line x1="${nx+fw}" y1="${groundY}" x2="${goal2D_x2.toFixed(1)}" y2="${goal2D_y2.toFixed(1)}" stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="4,4"/>` : ''}

  <!-- PITCH SECTION -->
  <g transform="translate(0,${pitchOffY.toFixed(2)}) scale(${pitchScale.toFixed(4)},${pitchScale.toFixed(4)})">
    ${buildPitchElements(g, fmt)}
  </g>

  <!-- net face label -->
  <text x="${vw-6}" y="${ny+fh+GROUNDH+D.gap-3}" text-anchor="end"
    font-family="DM Mono,monospace" font-size="7.5" fill="rgba(255,255,255,.18)">${NET_FORMATS[fmt].label}</text>

</svg>`
}

// ─── Summary builder ──────────────────────────────────────────────────────────
function buildSummary(g: GoalState, fmt: string): string {
  if (!g.goalType) return 'Select how the goal was scored to build a summary…'
  const parts: string[] = []
  if (g.bodyPart)  parts.push(`<span style="color:var(--accent)">${g.bodyPart}</span>`)
  if (g.technique) parts.push(`<span style="color:var(--accent)">${g.technique}</span>`)
  if (g.ballX != null) parts.push(`into the <span style="color:var(--accent)">${deriveZone(g.ballX, g.ballY!)}</span>`)
  if (g.shotX != null) parts.push(`from <span style="color:var(--accent)">${pitchZoneLabel(g.shotX, g.shotY!, fmt)}</span>`)
  const kl = keeperPosLabel(g.keeperXPct)
  if (kl !== 'centre') parts.push(`keeper <span style="color:var(--accent)">${kl}</span>`)
  if (g.scoreUs != null || g.scoreOpp != null) parts.push(`score <span style="color:var(--accent)">${g.scoreUs ?? '?'}–${g.scoreOpp ?? '?'}</span>`)
  if (g.period) parts.push(`<span style="color:var(--accent)">${g.period}</span>`)
  if (parts.length) return '⚽ ' + parts.join(' · ')
  return 'Tap the goal and pitch to fill in details…'
}

// ─── Posture SVG icons ────────────────────────────────────────────────────────
const StandIcon = () => (
  <svg width="22" height="26" viewBox="0 0 22 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="3.5" r="2.6" fill="currentColor" stroke="none"/>
    <line x1="11" y1="6.1" x2="11" y2="17"/>
    <line x1="1"  y1="11" x2="21" y2="11"/>
    <line x1="11" y1="17" x2="7"  y2="25"/>
    <line x1="11" y1="17" x2="15" y2="25"/>
  </svg>
)

const JumpIcon = () => (
  <svg width="22" height="27" viewBox="0 0 22 27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="3" r="2.6" fill="currentColor" stroke="none"/>
    <line x1="11" y1="5.6" x2="11" y2="15"/>
    <line x1="3"  y1="4"  x2="11" y2="8.5"/>
    <line x1="11" y1="8.5" x2="19" y2="4"/>
    <line x1="11" y1="15" x2="7"  y2="20"/>
    <line x1="7"  y1="20" x2="9"  y2="26"/>
    <line x1="11" y1="15" x2="15" y2="20"/>
    <line x1="15" y1="20" x2="13" y2="26"/>
  </svg>
)

const DiveIcon = () => (
  <svg width="30" height="24" viewBox="-2 -2 34 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <g transform="translate(15,12) rotate(-60)">
      <circle cy="-9" r="2.6" fill="currentColor" stroke="none"/>
      <line x1="0" y1="-6.4" x2="0" y2="3"/>
      <line x1="-5" y1="-1.5" x2="5" y2="-1.5"/>
      <line x1="0" y1="3" x2="-3.5" y2="9"/>
      <line x1="0" y1="3" x2="3.5"  y2="9"/>
    </g>
  </svg>
)

// ─── Per-goal editor ──────────────────────────────────────────────────────────
function GoalEditor({
  goal,
  format,
  overlaysOn,
  onChange,
}: {
  goal: GoalState
  format: string
  overlaysOn: boolean
  onChange: (g: GoalState) => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const goalRef = useRef(goal)
  goalRef.current = goal

  const [canvasLabel, setCanvasLabel] = useState(
    '<strong>Tap</strong> net to place ball &nbsp;·&nbsp; <strong>Tap</strong> pitch to mark shot &nbsp;·&nbsp; <strong>Drag</strong> keeper'
  )
  const [matchFmt, setMatchFmtState] = useState<'halves' | 'quarters'>('halves')

  // Partial DOM update for keeper drag — no React re-render
  const liveUpdate = useCallback((xPct: number) => {
    const D = getMergedDims(format)
    const kx = getKeeperX(D, xPct)
    const kg = canvasRef.current?.querySelector<SVGGElement>('#keeperG')
    if (kg) kg.innerHTML = keeperSVG(kx, D.groundY, D.fh * .68, { ...goalRef.current, keeperXPct: xPct })
    const pkd = canvasRef.current?.querySelector<SVGCircleElement>('#pitchKeeperDot')
    if (pkd) {
      const pf = PITCH_FORMATS[format]
      const ppx = P_W / pf.pitchW
      const kdx = (P_W / 2 - pf.goalW * ppx / 2) + xPct * (pf.goalW * ppx)
      pkd.setAttribute('cx', kdx.toFixed(1))
    }
  }, [format])

  // Rebuild SVG when goal state or format changes
  useEffect(() => {
    if (!canvasRef.current) return
    canvasRef.current.innerHTML = buildMergedSVG(goal, format, overlaysOn)

    const svg = canvasRef.current.querySelector<SVGSVGElement>('#mergedSVG')
    if (!svg) return

    function getSvgCoords(e: PointerEvent) {
      const rect = svg!.getBoundingClientRect()
      const vb = svg!.viewBox.baseVal
      return {
        x: (e.clientX - rect.left) * (vb.width / rect.width),
        y: (e.clientY - rect.top) * (vb.height / rect.height),
      }
    }

    function isOnKeeper(svgX: number, svgY: number, D: MergedDims) {
      const kx = getKeeperX(D, goalRef.current.keeperXPct)
      const bodyCy = D.ny + D.fh * 0.42
      return Math.abs(svgX - kx) < 28 && Math.abs(svgY - bodyCy) < D.fh * 0.52
    }

    function onPointerDown(e: PointerEvent) {
      const { x, y } = getSvgCoords(e)
      const D = getMergedDims(format)
      if (y < D.netBotY && isOnKeeper(x, y, D)) {
        isDraggingRef.current = true
        svg!.setPointerCapture(e.pointerId)
        svg!.style.cursor = 'grabbing'
        e.preventDefault()
      }
    }

    function onPointerMove(e: PointerEvent) {
      const { x, y } = getSvgCoords(e)
      const D = getMergedDims(format)
      if (!isDraggingRef.current) {
        svg!.style.cursor = (y < D.netBotY && isOnKeeper(x, y, D)) ? 'grab' : 'crosshair'
        return
      }
      e.preventDefault()
      const margin = POSTW + 10
      const xPct = Math.max(0, Math.min(1, (x - (D.nx - margin)) / (D.fw + margin * 2)))
      liveUpdate(xPct)
      // store in ref for commit on pointerup
      ;(svg as any)._pendingKeeperXPct = xPct
    }

    function onPointerUp(e: PointerEvent) {
      svg!.style.cursor = 'crosshair'
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        const xPct = (svg as any)._pendingKeeperXPct
        if (xPct != null) onChange({ ...goalRef.current, keeperXPct: xPct })
        return
      }
      const { x, y } = getSvgCoords(e)
      const D = getMergedDims(format)

      if (y < D.netBotY) {
        const { nx, ny, fw, fh } = D
        if (x >= nx && x <= nx + fw && y >= ny && y <= ny + fh) {
          const bx = (x - nx) / fw
          const by = Math.max(0, Math.min(1, (y - ny) / fh))
          onChange({ ...goalRef.current, ballX: bx, ballY: by })
          setCanvasLabel(`<strong>Tap</strong> pitch to mark shot &nbsp;·&nbsp; Ball → <span style="color:var(--accent)">${deriveZone(bx, by)}</span>`)
        }
      } else {
        const { pitchOffY, pitchScale } = D
        const pitchX = x / pitchScale
        const pitchY = (y - pitchOffY) / pitchScale
        if (pitchX >= 0 && pitchX <= P_W && pitchY >= P_GL && pitchY <= P_H) {
          onChange({ ...goalRef.current, shotX: pitchX, shotY: pitchY })
          setCanvasLabel(`<strong>Tap</strong> net to place ball &nbsp;·&nbsp; Shot from <span style="color:var(--accent)">${pitchZoneLabel(pitchX, pitchY, format)}</span>`)
        }
      }
    }

    function onPointerCancel() {
      isDraggingRef.current = false
      svg!.style.cursor = 'crosshair'
    }

    svg.addEventListener('pointerdown', onPointerDown)
    svg.addEventListener('pointermove', onPointerMove)
    svg.addEventListener('pointerup', onPointerUp)
    svg.addEventListener('pointercancel', onPointerCancel)

    return () => {
      svg.removeEventListener('pointerdown', onPointerDown)
      svg.removeEventListener('pointermove', onPointerMove)
      svg.removeEventListener('pointerup', onPointerUp)
      svg.removeEventListener('pointercancel', onPointerCancel)
    }
  }, [goal, format, overlaysOn, onChange, liveUpdate])

  function setPosture(p: 'standing' | 'jumping' | 'sliding') {
    onChange({ ...goal, keeperPosture: p })
  }

  function setGoalType(type: 'regular' | 'penalty' | 'freekick') {
    let updates: Partial<GoalState> = { goalType: type, bodyPart: null, technique: null }
    if (type === 'penalty') updates.keeperPosture = 'sliding'
    onChange({ ...goal, ...updates })
  }

  function setPeriod(p: string) {
    onChange({ ...goal, period: goal.period === p ? null : p })
  }

  function setMatchFmt(fmt: 'halves' | 'quarters') {
    setMatchFmtState(fmt)
    onChange({ ...goal, period: null })
  }

  const periodOptions = matchFmt === 'halves'
    ? ['1st half', '2nd half']
    : ['Q1', 'Q2', 'Q3', 'Q4']

  // Section visibility
  const showBody     = goal.goalType === 'regular' || goal.goalType === 'penalty'
  const showHead     = goal.goalType !== 'penalty'
  const postureDisabled = goal.goalType === 'penalty'

  const techOptions: { label: string; value: string }[] = goal.goalType === 'regular'
    ? [
        { label: 'Volley', value: 'Volley' },
        { label: 'Header', value: 'Header' },
        { label: 'Tap-in', value: 'Tap-in' },
        { label: 'Rebound', value: 'Rebound' },
        { label: 'Power shot', value: 'Power shot' },
        { label: 'Bicycle kick', value: 'Bicycle kick' },
      ]
    : goal.goalType === 'penalty'
    ? [
        { label: 'Power shot', value: 'Power shot' },
        { label: 'Panenka', value: 'Panenka' },
      ]
    : [
        { label: 'Over the wall', value: 'Over the wall' },
        { label: 'Around the wall', value: 'Around the wall (curl)' },
        { label: 'Header', value: 'Header' },
        { label: 'Tap-in', value: 'Tap-in' },
        { label: 'Rebound', value: 'Rebound' },
      ]

  const techLabel = goal.goalType === 'penalty' ? 'Penalty style' : goal.goalType === 'freekick' ? 'How did it go in?' : 'Technique'

  const summaryHtml = buildSummary(goal, format)
  const hasSummary  = goal.goalType != null

  // ── Styles (inline, matching preview) ──
  const sL: React.CSSProperties = { fontFamily: 'DM Mono', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)' }
  const chip = (active: boolean): React.CSSProperties => ({
    padding: '9px 18px', borderRadius: '999px', border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'rgba(232,255,71,0.1)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--muted)',
    fontFamily: 'DM Sans', fontSize: '17px', cursor: 'pointer', whiteSpace: 'nowrap' as const,
    transition: 'all 0.15s',
  })
  const kBtn = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '12px', borderRadius: '8px',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'rgba(232,255,71,0.1)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--muted)',
    fontFamily: 'DM Sans', fontSize: '17px', cursor: 'pointer', transition: 'all 0.15s',
  })
  const fmtBtn = (active: boolean): React.CSSProperties => ({
    fontFamily: 'DM Mono', fontSize: '13px', letterSpacing: '1px', padding: '5px 12px',
    borderRadius: '6px', cursor: 'pointer', transition: 'all .15s',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'rgba(232,255,71,.1)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--muted)',
  })
  const postureBtn = (active: boolean, disabled: boolean): React.CSSProperties => ({
    width: '50px', height: '42px', borderRadius: '8px',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'rgba(232,255,71,.12)' : 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: disabled ? 0.3 : 1, transition: 'all 0.15s',
    color: active ? 'var(--accent)' : 'var(--muted)',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Canvas + posture strip */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ ...sL, paddingLeft: '13%' }}>Ball placement &amp; keeper · Shot origin</span>
          </div>
          <div ref={canvasRef} style={{ width: '100%' }} />
          <div
            style={{ fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--muted)', textAlign: 'center', letterSpacing: '0.5px', lineHeight: 1.5, minHeight: '18px', marginTop: '8px' }}
            dangerouslySetInnerHTML={{ __html: canvasLabel }}
          />
        </div>

        {/* Posture column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', paddingTop: '8%', flexShrink: 0 }}>
          {(['standing', 'jumping', 'sliding'] as const).map((p, i) => (
            <div key={p} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
              <button
                type="button"
                onClick={() => !postureDisabled && setPosture(p)}
                disabled={postureDisabled && p !== 'sliding'}
                style={postureBtn(goal.keeperPosture === p, postureDisabled && p !== 'sliding')}
              >
                {i === 0 && <StandIcon />}
                {i === 1 && <JumpIcon />}
                {i === 2 && <DiveIcon />}
              </button>
              <span style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.5px' }}>
                {p === 'standing' ? 'Stand' : p === 'jumping' ? 'Jump' : 'Dive'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* Score — compact single row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ ...sL, whiteSpace: 'nowrap' as const }}>Score when you scored?</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px' }}>YOUR TEAM</span>
          <input
            type="number" min="0" max="20" value={goal.scoreUs ?? ''}
            onChange={e => onChange({ ...goal, scoreUs: e.target.value === '' ? null : parseInt(e.target.value) || 0 })}
            style={{ width: '60px', padding: '7px 4px', textAlign: 'center', fontSize: '28px', fontFamily: 'Bebas Neue', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--white)', outline: 'none' }}
          />
        </div>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: 'var(--muted)' }}>—</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px' }}>OPPONENTS</span>
          <input
            type="number" min="0" max="20" value={goal.scoreOpp ?? ''}
            onChange={e => onChange({ ...goal, scoreOpp: e.target.value === '' ? null : parseInt(e.target.value) || 0 })}
            style={{ width: '60px', padding: '7px 4px', textAlign: 'center', fontSize: '28px', fontFamily: 'Bebas Neue', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--white)', outline: 'none' }}
          />
        </div>
      </div>

      {/* Match period — single row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ ...sL, whiteSpace: 'nowrap' as const }}>Period</span>
        <button type="button" style={fmtBtn(matchFmt === 'halves')}   onClick={() => setMatchFmt('halves')}>HALVES</button>
        <button type="button" style={fmtBtn(matchFmt === 'quarters')} onClick={() => setMatchFmt('quarters')}>QUARTERS</button>
        <span style={{ color: 'var(--border)', fontSize: '16px' }}>|</span>
        {periodOptions.map(p => (
          <button key={p} type="button" style={kBtn(goal.period === p)} onClick={() => setPeriod(p)}>{p}</button>
        ))}
      </div>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* Goal type */}
      <div>
        <div style={{ ...sL, marginBottom: '10px' }}>How was it scored?</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['regular', 'penalty', 'freekick'] as const).map(t => (
            <button key={t} type="button" style={kBtn(goal.goalType === t)} onClick={() => setGoalType(t)}>
              {t === 'regular' ? '⚽ Regular' : t === 'penalty' ? '🎯 Penalty' : '🌀 Free-kick / Corner'}
            </button>
          ))}
        </div>
      </div>

      {/* Body part */}
      {showBody && (
        <div>
          <div style={{ ...sL, marginBottom: '10px' }}>Body part</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" style={chip(goal.bodyPart === 'Left foot')}  onClick={() => onChange({ ...goal, bodyPart: goal.bodyPart === 'Left foot' ? null : 'Left foot' })}>
              <span style={{ display: 'inline-block', transform: 'rotate(90deg) scaleX(-1)' }}>👟</span> Left foot
            </button>
            <button type="button" style={chip(goal.bodyPart === 'Right foot')} onClick={() => onChange({ ...goal, bodyPart: goal.bodyPart === 'Right foot' ? null : 'Right foot' })}>
              <span style={{ display: 'inline-block', transform: 'rotate(-90deg)' }}>👟</span> Right foot
            </button>
            {showHead && (
              <button type="button" style={chip(goal.bodyPart === 'Head')} onClick={() => onChange({ ...goal, bodyPart: goal.bodyPart === 'Head' ? null : 'Head' })}>
                👤 Head
              </button>
            )}
          </div>
        </div>
      )}

      {/* Technique */}
      {goal.goalType && (
        <div>
          <div style={{ ...sL, marginBottom: '10px' }}>{techLabel}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {techOptions.map(opt => (
              <button key={opt.value} type="button" style={chip(goal.technique === opt.value)}
                onClick={() => onChange({ ...goal, technique: goal.technique === opt.value ? null : opt.value })}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* Video */}
      <div>
        <div style={{ ...sL, marginBottom: '10px' }}>
          Video clip <span style={{ opacity: 0.4, fontSize: '12px', marginLeft: '4px' }}>optional</span>
        </div>
        <input
          type="url"
          placeholder="Paste YouTube, Instagram or TikTok link…"
          value={goal.videoUrl}
          onChange={e => onChange({ ...goal, videoUrl: e.target.value })}
          style={{ width: '100%', padding: '13px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--white)', fontFamily: 'DM Sans', fontSize: '17px', outline: 'none' }}
        />
      </div>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* Summary */}
      <div
        style={{ background: 'rgba(232,255,71,0.05)', border: '1px solid rgba(232,255,71,0.12)', borderRadius: '10px', padding: '16px 20px', fontSize: '17px', color: hasSummary ? 'var(--white)' : 'var(--muted)', lineHeight: 1.7, minHeight: '56px' }}
        dangerouslySetInnerHTML={{ __html: summaryHtml }}
      />
    </div>
  )
}

// ─── Main exported component ──────────────────────────────────────────────────
export default function GoalContributionCard({ goalCount, format, onChange }: Props) {
  const [goals, setGoals] = useState<GoalState[]>(() =>
    Array.from({ length: Math.max(1, goalCount) }, makeDefault)
  )
  const [current, setCurrent] = useState(0)
  const [overlaysOn, setOverlaysOn] = useState(false)

  // Sync goals array length when goalCount changes
  useEffect(() => {
    setGoals(prev => {
      const n = Math.max(1, goalCount)
      if (prev.length === n) return prev
      if (n > prev.length) return [...prev, ...Array.from({ length: n - prev.length }, makeDefault)]
      return prev.slice(0, n)
    })
    setCurrent(prev => Math.min(prev, Math.max(0, goalCount - 1)))
  }, [goalCount])

  // Notify parent whenever goals change
  useEffect(() => { onChange(goals) }, [goals, onChange])

  function updateGoal(idx: number, g: GoalState) {
    setGoals(prev => prev.map((x, i) => i === idx ? g : x))
  }

  const Toggle = () => (
    <div
      onClick={() => setOverlaysOn(o => !o)}
      style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' as const }}
    >
      <span style={{ fontFamily: 'DM Mono', fontSize: '12px', letterSpacing: '1px', color: overlaysOn ? 'var(--accent)' : 'var(--muted)', transition: 'color 0.15s' }}>OVERLAYS</span>
      <div style={{ width: '32px', height: '18px', borderRadius: '9px', background: overlaysOn ? 'rgba(232,255,71,0.2)' : '#1e3828', position: 'relative', transition: 'background 0.2s', border: `1px solid ${overlaysOn ? 'var(--accent)' : '#3a5a45'}`, flexShrink: 0 }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: overlaysOn ? 'var(--accent)' : 'var(--muted)', position: 'absolute', top: '3px', left: overlaysOn ? '17px' : '3px', transition: 'left 0.2s, background 0.2s' }} />
      </div>
    </div>
  )

  return (
    <div>
      {/* Navigation + overlays toggle (same row) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'DM Mono', fontSize: '13px', color: 'var(--muted)', letterSpacing: '1px', marginBottom: '16px' }}>
        {goalCount > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '5px', padding: '2px 8px', cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: current === 0 ? 0.4 : 1 }}
            >←</button>
            <span style={{ color: 'var(--white)' }}>GOAL {current + 1} OF {goalCount}</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <button
              type="button"
              onClick={() => setCurrent(c => Math.min(goalCount - 1, c + 1))}
              disabled={current === goalCount - 1}
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '5px', padding: '2px 8px', cursor: current === goalCount - 1 ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: current === goalCount - 1 ? 0.4 : 1 }}
            >→</button>
          </>
        )}
        <div style={{ flex: 1 }} />
        <Toggle />
      </div>

      {goals[current] && (
        <GoalEditor
          key={current}
          goal={goals[current]}
          format={format}
          overlaysOn={overlaysOn}
          onChange={g => updateGoal(current, g)}
        />
      )}
    </div>
  )
}
