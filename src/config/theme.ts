export const theme = {
  colors: {
    bg: '#080d12',
    card: '#0c1218',
    cardLight: '#162230',
    border: 'rgba(80,110,140,0.25)',
    primary: '#e8f4ff',
    secondary: '#7a95a8',
    muted: '#4a6070',
    green: '#3dc88c',
    amber: '#e8a030',
    red: '#e04050',
    yellow: '#e8c820',
  },
  gradients: {
    page: 'radial-gradient(ellipse at 50% 30%, #0f1a25 0%, #080d12 50%, #000 100%)',
    card: 'linear-gradient(145deg, rgba(15,22,35,0.95) 0%, rgba(8,12,22,0.98) 50%, rgba(5,8,15,0.99) 100%)',
    glassShine: 'linear-gradient(180deg, rgba(180,210,255,0.1) 0%, transparent 100%)',
  },
} as const;
