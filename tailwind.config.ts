import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        court: {
          50: '#effdf5',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d'
        },
        rally: {
          500: '#f59e0b',
          600: '#d97706'
        }
      },
      boxShadow: {
        panel: '0 24px 70px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
}

export default config

