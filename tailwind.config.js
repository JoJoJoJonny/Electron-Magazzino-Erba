/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
    	extend: {
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
				myColor: {
					50:  'hsl(122 23% 95%)', // L=95%
					100: 'hsl(122 23% 90%)', // L=90%
					200: 'hsl(122 23% 80%)', // L=80%
					300: 'hsl(122 23% 70%)', // L=70%
					400: 'hsl(122 23% 60%)', // L=60%
					500: 'hsl(122 23% 50%)', // Colore medio/principale
					600: 'hsl(122 23% 40%)', // L=40%
					700: 'hsl(122 23% 35%)', // L=35%
					800: 'hsl(122 23% 30%)', // L=30%
					900: 'hsl(122 23% 26%)', // Il tuo colore base originale (L=26%)
					DEFAULT: 'hsl(var(--myColor))',
					foreground: 'hsl(var(--myColor-foreground))',
				}
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
};
