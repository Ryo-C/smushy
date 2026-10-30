/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Smushy brand colors - Coral/Cream/Sage palette
        coral: {
          50: '#FFF5F3',
          100: '#FFE8E3',
          200: '#FFD1C7',
          300: '#FFB3A3',
          400: '#FF9580',
          500: '#FF7A5C',  // Primary brand color
          600: '#E6654A',
          700: '#CC5138',
          800: '#B33D26',
          900: '#992914',
        },
        cream: {
          50: '#FFFCF7',
          100: '#FFF8ED',
          200: '#FFF0D6',
          300: '#FFE8BF',
          400: '#FFD89E',
          500: '#FFC97D',  // Secondary/warm accents
          600: '#E6B56B',
          700: '#CCA159',
          800: '#B38D47',
          900: '#997935',
        },
        sage: {
          50: '#F7FAF8',
          100: '#EFF5F1',
          200: '#DEEAE3',
          300: '#CDDFD5',
          400: '#B3CFC1',
          500: '#99BFAD',  // Success/calm accent
          600: '#85AB99',
          700: '#719785',
          800: '#5D8371',
          900: '#496F5D',
        },

        // Legacy color aliases (for backward compatibility)
        primary: {
          50: '#FFF5F3',
          100: '#FFE8E3',
          200: '#FFD1C7',
          300: '#FFB3A3',
          400: '#FF9580',
          500: '#FF7A5C',
          600: '#E6654A',
          700: '#CC5138',
          800: '#B33D26',
          900: '#992914',
        },
        warmth: {
          50: '#FFFCF7',
          100: '#FFF8ED',
          200: '#FFF0D6',
          300: '#FFE8BF',
          400: '#FFD89E',
          500: '#FFC97D',
          600: '#E6B56B',
          700: '#CCA159',
          800: '#B38D47',
          900: '#997935',
        },

        // Semantic color tokens (mapped to default "Warm" theme)
        // For dynamic theming, use useTheme() hook in components
        'theme-primary': {
          DEFAULT: '#FF7A5C',    // coral-500
          dark: '#E6654A',       // coral-600
          light: '#FFB3A3',      // coral-300
        },
        'theme-secondary': {
          DEFAULT: '#FFC97D',    // cream-500
          dark: '#E6B56B',       // cream-600
          light: '#FFE8BF',      // cream-300
        },
        'theme-background': '#FAFAFA',     // gray-50
        'theme-surface': '#FFFFFF',        // white
        'theme-surface-variant': '#FFFCF7', // cream-50
        'theme-border': '#EEEEEE',         // gray-200
        'theme-border-light': '#FFF0D6',   // cream-200
        'theme-text-primary': '#212121',   // gray-900
        'theme-text-secondary': '#757575', // gray-600
        'theme-text-disabled': '#BDBDBD',  // gray-400
        'theme-text-inverse': '#FFFFFF',
        'theme-error': '#E63946',
        'theme-error-light': '#FFCCD1',
        'theme-success': '#99BFAD',        // sage-500
        'theme-success-light': '#DEEAE3',  // sage-200
        'theme-warning': '#FFB84D',
        'theme-warning-light': '#FFE8BF',
        'theme-info': '#5B9BD5',
        'theme-info-light': '#D4E5F7',
      },
      fontFamily: {
        sans: ['Nunito_400Regular'],
        'sans-medium': ['Nunito_500Medium'],
        'sans-semibold': ['Nunito_600SemiBold'],
        'sans-bold': ['Nunito_700Bold'],
      },
      spacing: {
        // Custom spacing based on 4px base unit
      }
    },
  },
  plugins: [],
}
