import type { Config } from 'tailwindcss'
import societyPreset from '@society/shared-ui-tokens/tailwind.config'

const config: Config = {
  presets: [societyPreset],

  content: [
    './src/**/*.{ts,tsx}',
    '../../../packages/shared-ui-components/src/**/*.{ts,tsx}',
  ],

  theme: {
    extend: {
      // Admin-app specific theme overrides go here
    },
  },

  plugins: [],
}

export default config
