/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1fbf6',
          100: '#dcf5e6',
          200: '#b8ebce',
          300: '#87d9ac',
          400: '#54c087',
          500: '#2fa46a',
          600: '#1f8455',
          700: '#1a6946',
          800: '#18543a',
          900: '#144531'
        },
        ink: {
          50: '#f6f7f8',
          100: '#eceef1',
          200: '#d5dae1',
          300: '#b0bac6',
          400: '#8592a3',
          500: '#657386',
          600: '#505c6d',
          700: '#424b59',
          800: '#39404c',
          900: '#232830'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.1)'
      }
    }
  },
  plugins: []
}
