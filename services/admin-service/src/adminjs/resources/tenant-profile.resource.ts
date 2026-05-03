import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { TenantProfile } from '../../database/entities/tenant-profile.entity'
import { Components } from '../adminjs.options'

const withSocietyScope = (
  request: ActionRequest,
  context: ActionContext,
): Promise<ActionRequest> => {
  const societyId = context.currentAdmin?.societyId as string | undefined
  if (societyId) {
    request.query = { ...request.query, 'filters.societyId': societyId }
  }
  return Promise.resolve(request)
}

/**
 * TenantProfile resource — read-only; encrypted fields hidden; masked PAN via component.
 * Section 16.3.2 of the PRD.
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
      list:   { before: withSocietyScope },
      search: { before: withSocietyScope },
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
