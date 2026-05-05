/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 content paths for Expo Router
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // ─── Colors ─────────────────────────────────────────────────────────────
      colors: {
        // ── Primary (Lumira Sage Green) ───────────────────────────────────────
        primary: {
          DEFAULT: '#A5A88C',
          200: '#E8EAE0',
          300: '#D1D4C1',
          400: '#BABDA2',
          500: '#A5A88C',
          600: '#8E9178',
          foreground: '#FFFFFF',
        },

        // ── Background & Surface ──────────────────────────────────────────────
        background: '#FFFFFF',
        surface:    '#F3F3F1',

        // ── Border & Input ────────────────────────────────────────────────────
        border: '#F3F3F1',
        input:  '#FFFFFF',
        ring:   '#A5A88C',

        // ── Text ─────────────────────────────────────────────────────────────
        foreground:       '#333333',
        'text-primary':   '#A5A88C',
        'text-secondary': '#666666',

        // ── Secondary ─────────────────────────────────────────────────────────
        secondary: {
          DEFAULT:    '#A5A88C',
          foreground: '#FFFFFF',
        },

        // ── Muted ─────────────────────────────────────────────────────────────
        muted: {
          DEFAULT:    '#F3F3F1',
          foreground: '#666666',
        },

        // ── Accent ────────────────────────────────────────────────────────────
        accent: {
          DEFAULT:    '#A5A88C',
          foreground: '#FFFFFF',
        },

        // ── Card ──────────────────────────────────────────────────────────────
        card: {
          DEFAULT:    '#FFFFFF',
          foreground: '#333333',
        },

        // ── Popover ───────────────────────────────────────────────────────────
        popover: {
          DEFAULT:    '#FFFFFF',
          foreground: '#333333',
        },

        // ── Status ────────────────────────────────────────────────────────────
        destructive: {
          DEFAULT:    '#A5A88C',
          foreground: '#FFFFFF',
        },
        error: {
          DEFAULT:    '#A5A88C',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT:    '#A5A88C',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT:    '#A5A88C',
          foreground: '#333333',
        },
      },

      // ─── Border Radius ───────────────────────────────────────────────────────
      borderRadius: {
        'organic-sm': '8px',
        'organic-md': '12px',
        'organic-lg': '16px',
        'organic-xl': '24px',
      },

      // ─── Font Family ─────────────────────────────────────────────────────────
      // Load these via expo-font in your _layout.js
      fontFamily: {
        heading: ['PlusJakartaSans', 'sans-serif'],
        body:    ['SourceSans3', 'sans-serif'],
        caption: ['Inter', 'sans-serif'],
        data:    ['JetBrainsMono', 'monospace'],
      },

      // ─── Font Size ───────────────────────────────────────────────────────────
      // clamp() and vw units don't work in RN — fixed px values used instead
      fontSize: {
        'fluid-xs':   '12px',
        'fluid-sm':   '14px',
        'fluid-base': '16px',
        'fluid-lg':   '18px',
        'fluid-xl':   '20px',
        'fluid-2xl':  '24px',
        'fluid-3xl':  '30px',
      },

      // ─── Spacing ─────────────────────────────────────────────────────────────
      spacing: {
        '18':  '72px',
        '88':  '352px',
        '240': '960px',
      },
    },
  },
  plugins: [],
  // Note: CSS animations (breathe, gentle-hover, smooth-transition) are not
  // supported in NativeWind — use react-native-reanimated instead
  // (already in your dependencies)
};