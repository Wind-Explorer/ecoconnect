const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  plugins: [
    require("@tailwindcss/typography"),
    nextui({
      themes: {
        "red-dark": {
          extend: "dark",
          colors: {
            background: "#1A0000",
            foreground: "#ffffff",
            primary: {
              50: "#FFE5E5",
              100: "#FFB3B3",
              200: "#FF8080",
              300: "#FF4040",
              400: "#F00000",
              500: "#D20000",
              600: "#B50000",
              700: "#960000",
              800: "#780000",
              900: "#610000",
              950: "#420000",
              DEFAULT: "#F00000",
              foreground: "#ffffff",
            },
            focus: "#FF4040",
          },
        },
        "red-light": {
          extend: "light", // <- inherit default values from light theme
          colors: {
            background: "#ffffff",
            foreground: "#1A0000",
            primary: {
              50: "#FFE5E5",
              100: "#FFB3B3",
              200: "#FF8080",
              300: "#FF4040",
              400: "#FF0000",
              500: "#E60000",
              600: "#CC0000",
              700: "#B30000",
              800: "#990000",
              900: "#800000",
              950: "#690000",
              DEFAULT: "#FF0000",
              foreground: "#ffffff",
            },
            focus: "#FF8080",
          },
        },
      },
    }),
  ],
};
