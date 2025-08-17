window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'main-red': '#D2282F',
        'secondary-blue': '#62A9F8',
        'comp-light-gray': '#F0E9E8',
        'comp-dark-blue': '#2427C3',
        'comp-muted-pink': '#AC8590',
        'comp-salmon': '#D26762',
        'box-dark': '#24303F',
        'main-dark': '#1A222C',
        'stroke': '#E2E8F0',
        'body-color': '#637381',
        'primary': '#3C50E0',
        'secondary': '#80CAEE'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem'
        }
      }
    }
  }
};