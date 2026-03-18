import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2764EB',
        'primary-hover': '#1E4FBB',
        surface: '#FFFFFF',
        background: '#F9FAFB',
        border: '#E5E7EB',
        ntext: '#0E121B',
        muted: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      boxShadow: {
        soft: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.04)',
        elevated: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.05)',
        input: '0 1px 2px 0 rgba(0,0,0,0.05)',
        glow: '0 0 0 3px rgba(39,100,235,0.15)',
      },
      borderRadius: {
        xs: '2px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
