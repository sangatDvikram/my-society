import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { FlatRental } from '../../database/entities/flat-rental.entity'

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
 * FlatRental resource — tenant-scoped; read-only; custom Download Document action.
 * Section 16.3.2 of the PRD.
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
      list:   { before: withSocietyScope },
      search: { before: withSocietyScope },
      /** Custom: Download Document — calls rental document download API */
      downloadDocument: {
        actionType: 'record',
        icon: 'Download',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Document download link generated', type: 'success' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'FlatRental' }),
        }),
      },
    },
    properties: {
      societyId: { isDisabled: true },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
