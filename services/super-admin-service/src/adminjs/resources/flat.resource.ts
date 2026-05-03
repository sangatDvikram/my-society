import { type ResourceWithOptions } from 'adminjs'

import { Flat } from '../../database/entities/flat.entity'

/**
 * Flat resource — cross-society read + limited edit; no delete.
 * Section 16.3.1 of the PRD.
 */
export const FlatResource: ResourceWithOptions = {
  resource: Flat,
  options: {
    navigation: { name: 'Platform', icon: 'Home' },
    actions: {
      new:        { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
    },
    properties: {
      societyId: { isDisabled: true },
    },
    sort: { sortBy: 'createdAt', direction: 'asc' },
  },
}
