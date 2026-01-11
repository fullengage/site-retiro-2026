/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                holi: {
                    dark: "hsl(var(--background))",
                    surface: "hsl(var(--card))",
                    primary: "hsl(var(--primary))",
                    secondary: "hsl(var(--secondary))",
                    accent: "hsl(var(--accent))",
                    orange: "#f97316",
                    green: "#84cc16",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                paper: "#fdfbf7",
            },
            fontFamily: {
                display: ["Montserrat", "sans-serif"],
                marker: ["Permanent Marker", "cursive"],
                news: ["Playfair Display", "serif"],
            },
            backgroundImage: {
                'noise': "url('https://www.transparenttextures.com/patterns/stardust.png')",
                'paper-texture': "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
                'grunge-overlay': "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
            },
            animation: {
                'blob': 'blob 7s infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'marquee': 'marquee 25s linear infinite',
                'spin-slow': 'spin-slow 12s linear infinite',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                'spin-slow': {
                    'from': { transform: 'rotate(0deg)' },
                    'to': { transform: 'rotate(360deg)' },
                }
            },
            screens: {
                'xs': '475px',
            }
        },
    },
    plugins: [],
}
