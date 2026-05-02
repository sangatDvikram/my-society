import type { Config } from 'tailwindcss'
import societyPreset from '@society/shared-ui-tokens/tailwind.config'

const config: Config = {
  // Extend the canonical Society design-token preset
  presets: [societyPreset],

  content: [
    './src/**/*.{ts,tsx}',
    // Include shared UI components so Tailwind can tree-shake their classes
    '../../../packages/shared-ui-components/src/**/*.{ts,tsx}',
  ],

  theme: {
    extend: {
      // Owner-app specific theme overrides go here
    },
  },

  plugins: [],
}

export default config
