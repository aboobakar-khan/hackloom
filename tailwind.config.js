/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: '#0A0A0A',
          surface: '#111111',
          'surface-hover': '#151515',
          sidebar: '#0D0D0D',
          border: 'rgba(255,255,255,0.06)',
          'border-light': 'rgba(255,255,255,0.05)',
          primary: '#F97316',
          'primary-hover': '#EA6C0A',
          text: '#F5F5F5',
          muted: '#888888',
          faint: '#444444',
          success: '#22C55E',
          warning: '#EAB308',
          error: '#EF4444',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
      },
      borderRadius: {
        'card': '10px',
        'btn': '6px',
      }
    },
  },
  plugins: [],
}
