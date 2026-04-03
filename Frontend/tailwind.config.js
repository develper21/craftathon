/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#205658',
        'primary-blue': '#0066FC',
        'light-bg': '#ACD8FF',
        'white-text': '#FFFFFF',
      },
      borderRadius: {
        'clay': '20px',
      },
      boxShadow: {
        'clay': '8px 8px 20px rgba(0,0,0,0.1), -8px -8px 20px rgba(255,255,255,0.7)',
        'clay-sm': '4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.5)',
      },
    },
  },
  plugins: [],
}
