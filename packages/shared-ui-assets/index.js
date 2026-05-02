/**
 * @society/shared-ui-assets
 *
 * Provides the resolved filesystem path to the shared assets directory so
 * consuming applications (Owner, Admin, Super Admin) can reference static
 * files via the monorepo workspace symlink without publishing to npm.
 *
 * Usage in a Next.js app (next.config.ts):
 *   const assetsPath = require('@society/shared-ui-assets').assetsPath;
 *
 * Usage in any Node.js context:
 *   const { assetsPath } = require('@society/shared-ui-assets');
 */

const path = require('path');

/** Absolute path to the `assets/` directory within this package. */
const assetsPath = path.resolve(__dirname, 'assets');

module.exports = { assetsPath };
