module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f62fe',
        clinic: {
          50: '#f7fbff',
          100: '#eef6ff',
          200: '#d7ebff',
          500: '#0f62fe',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
