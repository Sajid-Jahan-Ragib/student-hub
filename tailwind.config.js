/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1d92ff',
        'primary-strong': '#1770d4',
        accent: '#f7a600',
        bg: '#f6f7fb',
        card: '#ffffff',
        text: '#0f1623',
        muted: '#5d6b86',
      },
      fontFamily: {
        'space-grotesk': '"Space Grotesk", "Segoe UI", sans-serif',
      },
      borderRadius: {
        lg: '18px',
        sm: '14px',
      },
      maxWidth: {
        container: '760px',
      },
      boxShadow: {
        default: '0 18px 40px rgba(18, 38, 63, 0.08)',
        hero: '0 16px 38px rgba(23, 112, 212, 0.25)',
        avatar: '0 12px 25px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
