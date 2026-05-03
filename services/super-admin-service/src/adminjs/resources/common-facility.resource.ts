import { type ResourceWithOptions } from 'adminjs'

import { CommonFacility } from '../../database/entities/common-facility.entity'

/**
 * CommonFacility resource — cross-society full CRUD; no delete (use INACTIVE status).
 * Section 16.3.1 of the PRD.
 */
export const CommonFacilityResource: ResourceWithOptions = {
  resource: CommonFacility,
  options: {
    navigation: { name: 'Facilities', icon: 'MapPin' },
    actions: {
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
    },
    properties: {
      societyId:   { isDisabled: true },
      photoS3Keys: { isVisible: false },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
