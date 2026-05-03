import { type ResourceWithOptions } from 'adminjs'

import { EventMedia } from '../../database/entities/event-media.entity'

/**
 * EventMedia resource — cross-society; Remove custom action.
 * Section 16.3.1 of the PRD.
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
      remove: {
        actionType: 'record',
        icon: 'Trash2',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Media soft-deleted; moderationReason stored', type: 'danger' },
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
