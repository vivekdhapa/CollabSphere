/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          600: '#57534E',
          900: '#1C1917',
        },
        surface: '#f8f9fa',
        'surface-container-lowest': '#ffffff',
        'success-green': '#22BC66',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      fontSize: {
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
      },
      spacing: {
        'margin-mobile': '16px',
        'margin-desktop': '40px',
        'gutter': '24px',
        'base': '8px',
        'sidebar-width': '260px',
        'container-max': '1440px',
      },
      borderRadius: {
        DEFAULT: '4px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },
      boxShadow: {
        'ambient-card': '0px 4px 12px rgba(0,0,0,0.03)',
        'elevated': '0px 12px 32px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
