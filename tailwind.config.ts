import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0f1f16',
        'card-bg': '#162a1f',
        border: '#2a4a35',
        accent: '#e8ff47',
        'accent-dim': '#b8cc38',
        'app-white': '#f5f5f0',
        muted: '#8a9a8e',
        'cb-color': '#5ac8fa',
        'st-color': '#e8ff47',
        danger: '#ff5a5a',
        warning: '#ffb347',
        info: '#5ac8fa',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
