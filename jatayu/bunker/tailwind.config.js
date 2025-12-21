/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bunker: {
          primary: '#0D0D0D',
          card: '#1A1A1A',
          textPrimary: '#FFFFFF',
          textSecondary: '#A1A1A1',
          accent: '#3B82F6',
          accentHover: '#2563EB',
          border: '#2D2D2D'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
          backgroundImage: {
            'bunker-gradient': "radial-gradient(circle at center, #111 0%, #0d0d0d 100%)",
            'grid-pattern': `
              linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
          },
          backgroundSize: {
            'grid': '20px 20px',
          }
    }
  },
  plugins: [],
}
