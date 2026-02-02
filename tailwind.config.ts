import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        yacht: {
          bg: '#080d12',
          card: '#0c1218',
          'card-light': '#162230',
          border: 'rgba(80,110,140,0.25)',
          primary: '#e8f4ff',
          secondary: '#7a95a8',
          muted: '#4a6070',
          green: '#3dc88c',
          amber: '#e8a030',
          red: '#e04050',
          yellow: '#e8c820',
        },
      },
      boxShadow: {
        card: '0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
        'card-inset': 'inset 0 6px 20px rgba(0,0,0,0.4), inset 0 -2px 10px rgba(0,0,0,0.2)',
        'glow-green': '0 0 20px rgba(61,200,140,0.3)',
        'glow-red': '0 0 20px rgba(224,64,80,0.3)',
        'glow-amber': '0 0 20px rgba(232,160,48,0.3)',
      },
      backgroundImage: {
        'yacht-gradient': 'radial-gradient(ellipse at 50% 30%, #0f1a25 0%, #080d12 50%, #000 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(15,22,35,0.95) 0%, rgba(8,12,22,0.98) 50%, rgba(5,8,15,0.99) 100%)',
        'glass-shine': 'linear-gradient(180deg, rgba(180,210,255,0.1) 0%, transparent 100%)',
      },
      borderRadius: {
        card: '24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
