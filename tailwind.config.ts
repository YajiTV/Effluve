import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Palette Angora
                'angora-black': '#000000',
                'angora-white': '#FFFFFF',
                'angora-vanilla': '#CFC1A7',
                'angora-nero': '#222222',
            },
            fontFamily: {
                title: ['var(--font-title)'],
                body: ['var(--font-body)'],
            },
            spacing: {
                '128': '32rem',
                '144': '36rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
