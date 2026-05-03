import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { SocietyEvent } from '../../database/entities/society-event.entity'
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
 * SocietyEvent resource — Pin & Remove custom actions; EventStatusBadge component.
 * Section 16.3.2 of the PRD.
 */
export const SocietyEventResource: ResourceWithOptions = {
  resource: SocietyEvent,
  options: {
    navigation: { name: 'Events', icon: 'Star' },
    actions: {
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      list:   { before: withSocietyScope },
      search: { before: withSocietyScope },
      pin: {
        actionType: 'record',
        icon: 'Pin',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Event pinned to top of feed', type: 'success' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'SocietyEvent' }),
        }),
      },
      remove: {
        actionType: 'record',
        icon: 'Trash2',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Event removed; owner notified', type: 'danger' },
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
