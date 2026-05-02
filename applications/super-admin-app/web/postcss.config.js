/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    // postcss-import MUST be first: inlines @import statements before
    // Tailwind runs, merging oat.min.css into the same PostCSS document
    // so @layer base in oat.min.css has a valid @tailwind base context.
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
