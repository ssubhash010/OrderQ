/** @type {import('tailwindcss').Config} */
module.exports = {
    // This tells Tailwind to scan all your React components for class names
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        fontFamily: {
          // Sets Inter as the default sans-serif font for the whole app
          sans: ['Inter', 'sans-serif'],
          // Maps font-heading to Outfit for your bold, premium titles
          heading: ['Outfit', 'sans-serif'], 
        },
        // You can also add custom colors here later if you want to reuse them
        colors: {
          primary: '#f06e28',
          dark: {
            DEFAULT: '#121212',
            card: '#1c1c1e'
          }
        }
      },
    },
    plugins: [],
  }