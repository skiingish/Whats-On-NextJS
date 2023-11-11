/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    relative: true,
    files: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './layout/**/*.{js,ts,jsx,tsx,mdx}',
    ],
  },
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        'background-secondary': 'hsl(var(--background-secondary))',
        foreground: 'hsl(var(--foreground))',
        'text-foreground': 'hsl(var(--text-foreground))',
        highlight: 'hsl(var(--highlight))',
        btn: {
          background: 'hsl(var(--btn-background))',
          'background-hover': 'hsl(var(--btn-background-hover))',
          'secondary-background': 'hsl(var(--btn-secondary-background))',
          'secondary-background-hover':
            'hsl(var(--btn-secondary-background-hover))',
        },
      },
    },
  },
  plugins: [],
};
