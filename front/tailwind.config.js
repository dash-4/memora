/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        info: { DEFAULT: '#0ea5e9', light: '#e0f2fe', border: '#7dd3fc' },
        success: { DEFAULT: '#16a34a', light: '#dcfce7', border: '#86efac' },
        warning: { DEFAULT: '#ca8a04', light: '#fef9c3', border: '#fde047' },
        error: { DEFAULT: '#dc2626', light: '#fee2e2', border: '#fca5a5' },
      },
      spacing: { '18': '4.5rem', '22': '5.5rem', '30': '7.5rem' },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.06)',
        'soft-lg': '0 4px 16px rgba(0,0,0,0.08)',
        'inner-soft': 'inset 0 1px 2px rgba(0,0,0,0.04)',
      },
      fontSize: {
        display: ['2.5rem', { lineHeight: '1.2' }],
        title: ['1.5rem', { lineHeight: '1.3' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        caption: ['0.8125rem', { lineHeight: '1.4' }],
      },
      transitionDuration: { 250: '250ms' },
    },
  },
  plugins: [],
}
