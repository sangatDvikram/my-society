import { type ResourceWithOptions } from 'adminjs'

import { Society } from '../../database/entities/society.entity'

/**
 * Society resource — Super Admin has full CRUD across all societies.
 * Section 16.3.1 of the PRD.
 */
export const SocietyResource: ResourceWithOptions = {
  resource: Society,
  options: {
    navigation: { name: 'Platform', icon: 'Building' },
    actions: {
      bulkDelete: { isAccessible: false },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
