import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F4500B",
          hover: "#C73D08",
          light: "#FFF1EB",
        },
        surface: "#FAFAFA",
        charcoal: "#1C1C1C",
        olive: {
          DEFAULT: "#2D3A2E",
          light: "#3D4E3F",
          dark: "#1A2A1B",
        },
        mint: {
          DEFAULT: "#EDF5F0",
          dark: "#D8E8DD",
        },
        risk: {
          low: "#4CAF50",
          medium: "#FF9800",
          high: "#F44336",
          critical: "#D32F2F",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
