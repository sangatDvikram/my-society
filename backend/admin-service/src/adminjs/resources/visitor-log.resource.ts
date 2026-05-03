import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { VisitorLog } from '../../database/entities/visitor-log.entity'

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
 * VisitorLog resource — read-only; filterable by date, flat, gate.
 * Section 16.3.2 of the PRD.
 */
export const VisitorLogResource: ResourceWithOptions = {
  resource: VisitorLog,
  options: {
    navigation: { name: 'Visitors', icon: 'Users' },
    actions: {
      new:        { isAccessible: false },
      edit:       { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      list:   { before: withSocietyScope },
      search: { before: withSocietyScope },
    },
    properties: {
      societyId:      { isDisabled: true },
      phoneEncrypted: { isVisible: false },
      phoneHash:      { isVisible: false },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
