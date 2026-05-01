/** @type {import('tailwindcss').Config} */
// This file tells Tailwind CSS which files to scan for class names.
// Tailwind only includes CSS for classes it actually finds in these files,
// keeping the final CSS bundle as small as possible.
export default {
  content: [
    "./index.html",              // scan the root HTML file
    "./src/**/*.{js,ts,jsx,tsx}" // scan every JS/TS/JSX/TSX file inside src/
  ],
  theme: {
    extend: {
      // extend: lets you ADD to Tailwind's defaults without replacing them
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"] // use Inter as the primary font
      },
      animation: {
        // spin-slow: rotates an element one full turn over 60 seconds (used for clock)
        "spin-slow": "spin 60s linear infinite",
        // fade-in: smoothly appears an element when it mounts
        "fade-in": "fadeIn 0.4s ease-in-out"
      },
      keyframes: {
        // define what "fadeIn" does: starts invisible+shifted down, ends visible at normal place
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)"   }
        }
      }
    }
  },
  plugins: [] // no extra Tailwind plugins needed right now
}
