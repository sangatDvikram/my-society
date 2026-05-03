import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { Flat } from '../../database/entities/flat.entity'

/** Helper to append societyId filter from JWT claim. */
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
 * Flat resource — Scoped to own societyId; no delete.
 * Section 16.3.2 of the PRD.
 */
export const FlatResource: ResourceWithOptions = {
  resource: Flat,
  options: {
    navigation: { name: 'Society', icon: 'Home' },
    actions: {
      new:    { isAccessible: false },
      delete: { isAccessible: false },
      bulkDelete: { isAccessible: false },
      list:   { before: withSocietyScope },
      search: { before: withSocietyScope },
    },
    properties: {
      societyId: { isDisabled: true },
    },
    sort: { sortBy: 'createdAt', direction: 'asc' },
  },
}
