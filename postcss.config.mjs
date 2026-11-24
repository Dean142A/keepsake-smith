/**
 * Declaring this file replaces Next.js's built-in PostCSS pipeline, which
 * included autoprefixer. autoprefixer is listed explicitly so the storefront
 * keeps its vendor prefixes (globals.css relies on it for -webkit-backdrop-filter).
 *
 * The Tailwind plugin only transforms stylesheets that use Tailwind directives.
 * globals.css uses none, so it passes through untouched — which is what keeps
 * the storefront isolated from the admin's Tailwind build.
 */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};

export default config;
