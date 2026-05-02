/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    // postcss-import MUST be first: it inlines @import statements before
    // any other plugin runs. This lets @import '@knadh/oat/oat.min.css' in
    // globals.css get merged into the same PostCSS document as the
    // @tailwind directives, which resolves Tailwind v3's @layer ordering error.
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
