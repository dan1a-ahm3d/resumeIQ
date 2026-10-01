import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "outline-variant": "#c6c6cd",
        "inverse-primary": "#bec6e0",
        "surface-bright": "#f8f9ff",
        "on-secondary-container": "#57657b",
        "surface-container-highest": "#d3e4fe",
        "primary-fixed-dim": "#bec6e0",
        "surface-container-low": "#eff4ff",
        "on-tertiary": "#ffffff",
        "secondary": "#515f74",
        "surface-tint": "#565e74",
        "on-primary-container": "#7c839b",
        "surface-container-lowest": "#ffffff",
        "surface-variant": "#d3e4fe",
        "on-tertiary-container": "#98805d",
        "on-secondary-fixed-variant": "#3a485c",
        "background": "#f8f9ff",
        "tertiary-fixed": "#fcdeb5",
        "surface-container-high": "#dce9ff",
        "inverse-on-surface": "#eaf1ff",
        "secondary-fixed-dim": "#b9c7e0",
        "primary-container": "#131b2e",
        "surface-dim": "#cbdbf5",
        "on-error": "#ffffff",
        "surface": "#f8f9ff",
        "surface-container": "#e5eeff",
        "error": "#ba1a1a",
        "on-primary-fixed-variant": "#3f465c",
        "secondary-fixed": "#d5e3fd",
        "outline": "#76777d",
        "tertiary-fixed-dim": "#dec29a",
        "inverse-surface": "#213145",
        "on-error-container": "#93000a",
        "on-secondary-fixed": "#0d1c2f",
        "error-container": "#ffdad6",
        "on-primary": "#ffffff",
        "on-background": "#0b1c30",
        "on-primary-fixed": "#131b2e",
        "secondary-container": "#d5e3fd",
        "primary": "#000000",
        "on-secondary": "#ffffff",
        "on-tertiary-fixed-variant": "#574425",
        "primary-fixed": "#dae2fd",
        "on-tertiary-fixed": "#271901",
        "on-surface": "#0b1c30",
        "tertiary": "#000000",
        "on-surface-variant": "#45464d",
        "tertiary-container": "#271901"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      spacing: {
        "space-xl": "2rem",
        "space-lg": "1.5rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-xs": "0.25rem",
        gutter: "1rem",
        margin: "1.5rem"
      },
      fontFamily: {
        "body-default": ["var(--font-inter)", "Inter", "sans-serif"],
        "headline-lg-mobile": ["var(--font-inter)", "Inter", "sans-serif"],
        "table-header": ["var(--font-inter)", "Inter", "sans-serif"],
        "meta-medium": ["var(--font-inter)", "Inter", "sans-serif"],
        "label-default": ["var(--font-inter)", "Inter", "sans-serif"],
        "headline-md": ["var(--font-inter)", "Inter", "sans-serif"],
        "headline-sm": ["var(--font-inter)", "Inter", "sans-serif"],
        "meta-default": ["var(--font-inter)", "Inter", "sans-serif"],
        "headline-lg": ["var(--font-inter)", "Inter", "sans-serif"],
        "body-medium": ["var(--font-inter)", "Inter", "sans-serif"],
        "code-mono": ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"]
      },
      fontSize: {
        "body-default": ["14px", { lineHeight: "20px", letterSpacing: "-0.006em", fontWeight: "400" }],
        "headline-lg-mobile": ["22px", { lineHeight: "28px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "table-header": ["11px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "600" }],
        "meta-medium": ["12px", { lineHeight: "16px", letterSpacing: "0", fontWeight: "500" }],
        "label-default": ["13px", { lineHeight: "18px", letterSpacing: "-0.005em", fontWeight: "500" }],
        "headline-md": ["20px", { lineHeight: "26px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-sm": ["16px", { lineHeight: "22px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "meta-default": ["12px", { lineHeight: "16px", letterSpacing: "0", fontWeight: "400" }],
        "headline-lg": ["26px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "body-medium": ["14px", { lineHeight: "20px", letterSpacing: "-0.006em", fontWeight: "500" }],
        "code-mono": ["12px", { lineHeight: "16px", letterSpacing: "0", fontWeight: "400" }]
      }
    }
  },
  plugins: []
};
export default config;
