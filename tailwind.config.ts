import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#E8F5EE",
          100: "#CDEAD8",
          200: "#9BD5B0",
          300: "#69C088",
          400: "#3FAE6A",
          500: "#22A055",
          600: "#1B8347",
          700: "#156738",
          800: "#0F4D2A",
          900: "#0A341C"
        },
        ink: {
          900: "#1A1F1B",
          700: "#3A4338",
          500: "#6B7568",
          300: "#A9B2A6",
          100: "#E5E9E2"
        },
        bg: {
          DEFAULT: "#F7F4EE",
          card: "#FFFFFF",
          warn: "#FFF7E6",
          danger: "#FDECEC"
        }
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "\"Hiragino Sans\"", "\"Hiragino Kaku Gothic ProN\"", "Meiryo", "sans-serif"]
      }
    }
  },
  plugins: []
};
export default config;
