import { type ResourceWithOptions } from 'adminjs'

import { TenantProfile } from '../../database/entities/tenant-profile.entity'
import { Components } from '../adminjs.options'

/**
 * TenantProfile resource — cross-society read-only; encrypted fields hidden.
 * Section 16.3.1 of the PRD.
 */
export const TenantProfileResource: ResourceWithOptions = {
  resource: TenantProfile,
  options: {
    navigation: { name: 'Rentals', icon: 'UserCheck' },
    actions: {
      new:        { isAccessible: false },
      edit:       { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
    },
    properties: {
      societyId:            { isDisabled: true },
      panEncrypted:         { isVisible: false },
      tenantPhoneEncrypted: { isVisible: false },
      tenantPhoneHash:      { isVisible: false },
      panLast4: {
        isVisible: { list: true, show: true, edit: false, filter: false },
        components: {
          list: Components.PanDisplay,
          show: Components.PanDisplay,
        },
      },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
