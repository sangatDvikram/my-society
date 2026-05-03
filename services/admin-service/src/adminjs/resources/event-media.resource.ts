import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { EventMedia } from '../../database/entities/event-media.entity'

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
 * EventMedia resource — read-only list/show; Remove custom action.
 * Section 16.3.2 of the PRD.
 */
export const EventMediaResource: ResourceWithOptions = {
  resource: EventMedia,
  options: {
    navigation: { name: 'Events', icon: 'Image' },
    actions: {
      new:        { isAccessible: false },
      edit:       { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      list:   { before: withSocietyScope },
      search: { before: withSocietyScope },
      remove: {
        actionType: 'record',
        icon: 'Trash2',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Media removed; organiser notified', type: 'danger' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'EventMedia' }),
        }),
      },
    },
    properties: {
      societyId: { isDisabled: true },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
