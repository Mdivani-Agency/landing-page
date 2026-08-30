/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      padding: '8rem',
    },
    extend: {
      colors: {
        gray: {
          100: "#C3D2CE",
          700: "#292929"
        },
        canvas: "var(--bg-primary)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        subtle: "var(--border-subtle)",
        card: "var(--card-bg)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "DM Sans", "sans-serif"],
        serif: ["var(--font-serif)", "Fraunces", "serif"],
      },
      fontSize: {
        "3xl": "var(--text-3xl)",
        "2xl": "var(--text-2xl)",
        "xl": "var(--text-xl)",
        "lg": "var(--text-lg)",
        "title": "var(--text-title)",
        "md": "var(--text-md)",
        "sm": "var(--text-sm)",
        "xs": "var(--text-xs)",
        "xxs": "var(--text-xxs)",
        display: [
          "clamp(3.6rem, 7vw, 7.2rem)",
          { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "450" },
        ],
        heading: [
          "clamp(2.8rem, 4vw, 4.4rem)",
          { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "450" },
        ],
      },
      spacing: {
        "0.5": "0.4rem",
        "1": "0.8rem",
        "1.5": "1.2rem",
        "2": "1.6rem",
        "2.5": "2rem",
        "3": "2.4rem",
        "4": "3.2rem",
        "5": "4rem",
        "5.5": "4.4rem",
        "6": "4.8rem",
        "7": "5.6rem",
        "8": "6.4rem",
        "9": "7.2rem",
        "10": "8rem",
        "11": "8.8rem",
        "12": "9.6rem",
        "15": "12rem",
        "24": "19.2rem",
        "30": "24rem",
        "32": "30rem",
      },
      lineHeight: {
        "1": "1.25",
        "2": "1.3",
        "3": "1.4",
        "4": "1.5",
      },
      letterSpacing: {
        caps: "0.12em",
        label: "0.08em",
      },
      maxWidth: {
        site: "var(--site-max-width)",
      },
      borderRadius: {
        md: "2.4rem",
        card: "1.6rem",
      }
    },
  },
  plugins: [],
}
