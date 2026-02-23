import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sf: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.16)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        'profile-glow': '0 0 40px 12px rgba(255, 255, 255, 0.08)',
      },
      colors: {
        spec: {
          ink: '#0A0A0A',
          bar: 'rgba(34, 34, 35, 0.82)',
          accent: '#0077B5',
          gray: '#1D1D1F',
          darkgray: '#333334',
          orange: '#FF6B00',
          teal: '#4DA8A8',
          'light-bg': '#F5F5F7',
        },
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(90deg, #ffffff 0%, #a8d8d8 40%, #6cb8b8 70%, #4da8a8 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config
