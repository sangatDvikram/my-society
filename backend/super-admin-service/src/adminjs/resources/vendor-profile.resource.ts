import { type ResourceWithOptions } from 'adminjs'

import { VendorProfile } from '../../database/entities/vendor-profile.entity'

/**
 * VendorProfile resource — cross-society; masked phone; Reveal Phone custom action.
 * Section 16.3.1 of the PRD.
 */
export const VendorProfileResource: ResourceWithOptions = {
  resource: VendorProfile,
  options: {
    navigation: { name: 'Vendors', icon: 'Tool' },
    actions: {
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      revealPhone: {
        actionType: 'record',
        icon: 'Phone',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Phone reveal logged in AdminAuditLog', type: 'info' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'VendorProfile' }),
        }),
      },
    },
    properties: {
      societyId:      { isDisabled: true },
      phoneEncrypted: { isVisible: false },
      phoneHash:      { isVisible: false },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
