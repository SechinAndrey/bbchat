/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],

  darkMode: "class",

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
          hover: "var(--color-primary-hover)",
          focus: "var(--color-primary-focus)",
          active: "var(--color-primary-active)",
          easy: "var(--color-primary-easy)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          hover: "var(--color-success-hover)",
          focus: "var(--color-success-focus)",
          active: "var(--color-success-active)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          hover: "var(--color-danger-hover)",
          focus: "var(--color-danger-focus)",
          active: "var(--color-danger-active)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
          focus: "var(--color-secondary-focus)",
          active: "var(--color-secondary-active)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          hover: "var(--color-warning-hover)",
          focus: "var(--color-warning-focus)",
          active: "var(--color-warning-active)",
        },
        neutral: {
          DEFAULT: "var(--color-neutral)",
          hover: "var(--color-neutral-hover)",
          focus: "var(--color-neutral-focus)",
          active: "var(--color-neutral-active)",
        },
        theme: {
          bg: "var(--bg)",
          text: "var(--text)",
          surface: "var(--bg-surface)",
          "surface-variant": "var(--bg-surface-variant)",
          conversations: "var(--bg-conversations)",
          message: "var(--bg-message)",
          nav: "var(--nav-bg)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        scrollbar: {
          track: "var(--scrollbar-track)",
          thumb: "var(--scrollbar-thumb)",
          "thumb-hover": "var(--scrollbar-thumb-hover)",
        },
        cbg: {
          10: "var(--cbg-10)",
        },
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
        "shadow-sm": "0rem .0625rem .1875rem 0rem rgba(5,5,5,0.10)",
        shadow:
          "rgb(145 158 171 / 20%) 0rem .0625rem .1875rem 0rem , rgb(145 158 171 / 12%) 0rem .0625rem .125rem -0.25rem",
        "shadow-md": "0rem .1875rem .25rem 0rem rgba(3,3,3,0.1), 0rem .125rem .25rem 0rem rgba(3,3,3,0.1)",
        "shadow-lg": "0rem .625rem 1.25rem 0rem rgba(3,3,3,0.1), 0rem .1875rem .375rem 0rem rgba(3,3,3,0.1)",
        "shadow-xl": "0rem .9375rem 1.5625rem 0rem rgba(3,3,3,0.1), 0rem .3125rem .625rem 0rem rgba(3,3,3,0.1)",
        cxl: "0 .125rem .3125rem rgba(193, 202, 255, 0.5), .125rem 0 .3125rem rgba(193, 202, 255, 0.5), -0.125rem 0 .3125rem rgba(193, 202, 255, 0.5), 0 -0.125rem .3125rem rgba(193, 202, 255, 0.5)",
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
