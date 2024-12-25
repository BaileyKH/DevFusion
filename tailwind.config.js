/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			fira: ['Fira Code"', 'monospace']
  		},
  		colors: {
  			primDark: '#121212',
  			secDark: '#080808',
  			primAccent: '#0398fc',
  			lightAccent: '#FFFFFF',
  			darkAccent: '#b3b3b3'
  		},
  		backgroundImage: {
  			'radial-bg': 'radial-gradient(circle, #450a0a, #000000)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			'background-position-spin': 'background-position-spin 3000ms infinite alternate',
  			'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
  			shine: 'shine var(--duration) infinite linear'
  		},
  		keyframes: {
  			'background-position-spin': {
  				'0%': {
  					backgroundPosition: 'top center'
  				},
  				'100%': {
  					backgroundPosition: 'bottom center'
  				}
  			},
  			'border-beam': {
  				'100%': {
  					'offset-distance': '100%'
  				}
  			},
  			shine: {
  				'0%': {
  					'background-position': '0% 0%'
  				},
  				'50%': {
  					'background-position': '100% 100%'
  				},
  				to: {
  					'background-position': '0% 0%'
  				}
  			}
  		}
  	}
  },
  plugins: [],
}