/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: "24px", // px-6 matches design token
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",

                // --- Design System Colors (Strict Match) ---
                app: {
                    primary: "#0f2920",    // 메인 배경 (어두운 녹색)
                    secondary: "#1a3d32",  // 카드 배경
                    tertiary: "#234a3d",   // Hover 배경
                    accent: {
                        DEFAULT: "#00ff88", // 강조색 (밝은 녹색)
                        hover: "#00dd77",   // 강조색 Hover
                        light: "rgba(0, 255, 136, 0.2)",
                    },
                },
                text: {
                    primary: "#ffffff",
                    secondary: "#d1d5db", // gray-300
                    muted: "#9ca3af",     // gray-400
                    disabled: "#6b7280",  // gray-500
                },
                status: {
                    success: "#22c55e",
                    warning: "#eab308",
                    error: "#ef4444",
                    info: "#3b82f6",
                },
                // ------------------------------------------

                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                'card': '16px',   // 16px from design token
                'button': '12px', // 12px from design token
                'input': '12px',  // 12px from design token
            },
            spacing: {
                'page-x': '24px', // px-6
                'page-y': '32px', // pt-8
                'nav-h': '80px',  // navigation height
                'btn-h': '56px',  // button height (h-14)
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
