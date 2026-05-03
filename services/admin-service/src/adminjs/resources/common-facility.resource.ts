import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { CommonFacility } from '../../database/entities/common-facility.entity'

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
 * CommonFacility resource — CRUD (no delete); Admin adds blackouts via custom action.
 * Section 16.3.2 of the PRD.
 */
export const CommonFacilityResource: ResourceWithOptions = {
  resource: CommonFacility,
  options: {
    navigation: { name: 'Facilities', icon: 'MapPin' },
    actions: {
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      list:   { before: withSocietyScope },
      search: { before: withSocietyScope },
      /** Custom: Add Blackout — creates a FacilityBlackout record */
      addBlackout: {
        actionType: 'record',
        icon: 'CalendarX',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Blackout period added', type: 'success' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'CommonFacility' }),
        }),
      },
    },
    properties: {
      societyId:   { isDisabled: true },
      photoS3Keys: { isVisible: false },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
