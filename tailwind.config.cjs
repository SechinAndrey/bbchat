/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],

  darkMode: ['[data-theme="dark"]'],

  theme: {
    screens: {
      xs: "0rem",
      md: "60.5rem",
      lg: "64rem",
      xl: "80rem",
      "2xl": "96rem",
    },

    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          lighter: "var(--color-primary-lighter)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          lighter: "var(--color-secondary-lighter)",
        },
        success: {
          DEFAULT: "var(--color-state-success)",
        },
        info: {
          DEFAULT: "var(--color-state-info)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
        },
        danger: {
          DEFAULT: "var(--color-state-danger)",
        },
        "app-text": {
          DEFAULT: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
        },
        "app-bg": {
          DEFAULT: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
        },
        "app-border": "var(--color-border)",
        "app-divider": "var(--color-divider)",
      },

      spacing: {
        0: "0",
        1: ".125rem",
        2: ".25rem",
        3: ".5rem",
        4: ".75rem",
        5: "1rem",
        6: "1.5rem",
        7: "2rem",
        8: "2.5rem",
        9: "3rem",
        10: "4rem",
        11: "5rem",
        12: "6rem",
        13: "10rem",
      },

      fontFamily: {
        sans: ["Open Sans", "sans-serif"],
        display: ["Fredoka"],
      },

      borderRadius: {
        none: "0",
        sm: ".5rem",
        DEFAULT: ".75rem",
        lg: "1.25rem",
        full: "624.9375rem",
      },

      opacity: {
        0: "0",
        20: "0.20",
        30: "0.30",
        40: "0.40",
        50: "0.54",
        60: "0.63",
        70: "0.70",
        80: "0.80",
        90: "0.90",
        100: "1",
      },

      boxShadow: {
        sm: "0 1px 2px 0 var(--color-shadow)",
        DEFAULT: "0 1px 3px 0 var(--color-shadow), 0 1px 2px 0 var(--color-shadow)",
        md: "0 4px 6px -1px var(--color-shadow), 0 2px 4px -1px var(--color-shadow)",
        lg: "0 10px 15px -3px var(--color-shadow), 0 4px 6px -2px var(--color-shadow)",
        xl: "0 20px 25px -5px var(--color-shadow), 0 8px 10px -6px var(--color-shadow)",
        cxl: "0 .125rem .3125rem rgba(193, 202, 255, 0.5), .125rem 0 .3125rem rgba(193, 202, 255, 0.5), -0.125rem 0 .3125rem rgba(193, 202, 255, 0.5), 0 -0.125rem .3125rem rgba(193, 202, 255, 0.5)",
        up: "0 -4px 12px 0 var(--color-shadow)",
        down: "0 4px 12px 0 var(--color-shadow)",
        left: "-4px 0 12px 0 var(--color-shadow)",
        right: "4px 0 12px 0 var(--color-shadow)",
        "up-md": "0 -8px 24px 0 var(--color-shadow)",
        "down-xl": "0 20px 40px 0 var(--color-shadow)",
      },

      keyframes: {
        gradient: {
          "0%": {
            "background-position": "0% 0%",
          },

          "50%": {
            "background-position": "0% 100%",
          },

          "100%": {
            "background-position": "0% 0%",
          },
        },
      },

      animation: {
        gradient: "gradient 15s ease infinite",
      },
    },
  },

  plugins: [],
};
