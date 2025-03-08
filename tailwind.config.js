/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            color: 'var(--foreground)',
            h1: {
              color: 'var(--foreground)',
              fontWeight: '600',
            },
            h2: {
              color: 'var(--foreground)',
              fontWeight: '600',
            },
            h3: {
              color: 'var(--foreground)',
              fontWeight: '600',
            },
            h4: {
              color: 'var(--foreground)',
              fontWeight: '600',
            },
            p: {
              color: 'var(--foreground)',
            },
            a: {
              color: 'var(--primary)',
              '&:hover': {
                color: 'var(--primary)',
              },
            },
            code: {
              color: 'var(--foreground)',
              backgroundColor: 'var(--muted)',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            pre: {
              backgroundColor: 'var(--muted)',
              color: 'var(--foreground)',
              borderRadius: '0.25rem',
              padding: '1em',
            },
            blockquote: {
              color: 'var(--foreground)',
              borderLeftColor: 'var(--border)',
            },
            hr: {
              borderColor: 'var(--border)',
            },
            ul: {
              li: {
                '&::marker': {
                  color: 'var(--muted-foreground)',
                },
              },
            },
            ol: {
              li: {
                '&::marker': {
                  color: 'var(--muted-foreground)',
                },
              },
            },
            table: {
              thead: {
                borderBottomColor: 'var(--border)',
                th: {
                  color: 'var(--foreground)',
                },
              },
              tbody: {
                tr: {
                  borderBottomColor: 'var(--border)',
                },
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
} 