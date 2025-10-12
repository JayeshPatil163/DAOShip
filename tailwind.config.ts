import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// DAOShip custom colors - updated to Algorand-inspired colors
				daoship: {
					'purple': '#0FA0CE', // Algorand blue
					'indigo': '#3C5CFF', // Brighter blue
					'blue': '#25ADFF', // Lighter blue
					'dark-blue-1': '#111827', // Darker background
					'dark-blue-2': '#182446', // Slightly lighter dark blue
					'text-gray': '#F1F1FF', // Slightly brighter text
					'mint': '#22BFA3', // More teal-like green (Algorand color)
					'red': '#FF5E7A',
					'yellow': '#FFDC5E'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'glow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.6' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 10px 2px rgba(15, 160, 206, 0.4)' },
					'50%': { boxShadow: '0 0 20px 5px rgba(15, 160, 206, 0.7)' }
				},
				'move-background': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'particle-move': {
					'0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
					'50%': { opacity: '1' },
					'100%': { transform: 'translateY(-100px) translateX(20px)', opacity: '0' }
				},
				'blob-move': {
					'0%, 100%': { transform: 'translate(0, 0) scale(1)' },
					'25%': { transform: 'translate(20px, -30px) scale(1.05)' },
					'50%': { transform: 'translate(0, -50px) scale(0.95)' },
					'75%': { transform: 'translate(-20px, -20px) scale(1.05)' }
				},
				'rotate-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-15px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'move-background': 'move-background 8s ease infinite',
				'particle-move': 'particle-move 10s ease-out infinite',
				'blob-move': 'blob-move 25s ease-in-out infinite',
				'rotate-slow': 'rotate-slow 60s linear infinite',
				'bounce-subtle': 'bounce-subtle 6s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-primary': 'linear-gradient(135deg, #0FA0CE, #3C5CFF)',  // Updated
				'gradient-background': 'linear-gradient(135deg, #111827, #182446)',  // Updated
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;