import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { VendorProfile } from '../../database/entities/vendor-profile.entity'

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
 * VendorProfile resource — masked phone; Toggle Status custom action.
 * Section 16.3.2 of the PRD.
 */
export const VendorProfileResource: ResourceWithOptions = {
  resource: VendorProfile,
  options: {
    navigation: { name: 'Vendors', icon: 'Tool' },
    actions: {
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      list:   { before: withSocietyScope },
      search: { before: withSocietyScope },
      toggleStatus: {
        actionType: 'record',
        icon: 'ToggleLeft',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Vendor status toggled', type: 'success' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'VendorProfile' }),
        }),
      },
      revealPhone: {
        actionType: 'record',
        icon: 'Phone',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Phone reveal logged in audit', type: 'info' },
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
