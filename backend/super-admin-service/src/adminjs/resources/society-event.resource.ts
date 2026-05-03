import { type ResourceWithOptions } from 'adminjs'

import { SocietyEvent } from '../../database/entities/society-event.entity'
import { Components } from '../adminjs.options'

/**
 * SocietyEvent resource — cross-society; Pin/Remove custom actions.
 * Create official events via createdByRole = ADMIN.
 * Section 16.3.1 of the PRD.
 */
export const SocietyEventResource: ResourceWithOptions = {
  resource: SocietyEvent,
  options: {
    navigation: { name: 'Events', icon: 'Star' },
    actions: {
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      pin: {
        actionType: 'record',
        icon: 'Pin',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Event pinned; previous pin cleared', type: 'success' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'SocietyEvent' }),
        }),
      },
      remove: {
        actionType: 'record',
        icon: 'Trash2',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Event removed; organiser notified', type: 'danger' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'SocietyEvent' }),
        }),
      },
    },
    properties: {
      societyId: { isDisabled: true },
      status: {
        isVisible: { list: true, show: true, edit: false, filter: true },
        components: {
          list: Components.EventStatusBadge,
          show: Components.EventStatusBadge,
        },
      },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
