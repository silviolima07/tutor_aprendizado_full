/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      // Mantendo suas cores originais
      colors: {
        primary: "hsl(210, 80%, 50%)",
        secondary: "hsl(10, 70%, 50%)"
      },
      // Adicionando a nova velocidade de pulsação rápida
      animation: {
        'pulse-fast': 'pulse-fast 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      // Definindo o comportamento visual do pulso (tamanho e opacidade)
      keyframes: {
        'pulse-fast': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.1', transform: 'scale(1.3)' },
        },
      },
    }
  },
  darkMode: "class",
  plugins: []
};