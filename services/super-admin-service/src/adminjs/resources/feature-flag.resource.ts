import { type ResourceWithOptions } from 'adminjs'

import { FeatureFlag } from '../../database/entities/feature-flag.entity'

/**
 * FeatureFlag resource — Super Admin can toggle flags; propagation ≤ 60 s.
 * Section 16.3.1 & 16.9 of the PRD.
 */
export const FeatureFlagResource: ResourceWithOptions = {
  resource: FeatureFlag,
  options: {
    navigation: { name: 'Platform', icon: 'Flag' },
    actions: {
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
    },
    properties: {
      societyId: { isDisabled: true },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
