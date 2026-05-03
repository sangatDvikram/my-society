import { type ResourceWithOptions } from 'adminjs'

import { FlatRental } from '../../database/entities/flat-rental.entity'

/**
 * FlatRental resource — cross-society read-only; filter by status, flat, society.
 * Section 16.3.1 of the PRD.
 */
export const FlatRentalResource: ResourceWithOptions = {
  resource: FlatRental,
  options: {
    navigation: { name: 'Rentals', icon: 'Key' },
    actions: {
      new:        { isAccessible: false },
      edit:       { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
    },
    properties: {
      societyId: { isDisabled: true },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
