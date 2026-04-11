/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#0f1117",
        surface: "#161b22",
        card:    "#1c2333",
        border:  "#30363d",
        muted:   "#8b949e",
        text:    "#e6edf3",
        subtle:  "#c9d1d9",
        red:     "#f85149",
        orange:  "#f0883e",
        yellow:  "#d29922",
        green:   "#3fb950",
        blue:    "#58a6ff",
        purple:  "#bc8cff",
        pink:    "#ff7b72",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        modal: "0 8px 32px rgba(0,0,0,0.6)",
      }
    }
  },
  plugins: []
};
