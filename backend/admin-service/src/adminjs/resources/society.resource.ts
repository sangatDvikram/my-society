import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { Society } from '../../database/entities/society.entity'

/**
 * Society resource — Admin can view own society only (tenant-scoped via before hook).
 * Section 16.3.2 of the PRD.
 */
export const SocietyResource: ResourceWithOptions = {
  resource: Society,
  options: {
    navigation: { name: 'Society', icon: 'Building' },
    actions: {
      new:    { isAccessible: false },
      delete: { isAccessible: false },
      bulkDelete: { isAccessible: false },
      list: {
        before: (request: ActionRequest, context: ActionContext): Promise<ActionRequest> => {
          const societyId = context.currentAdmin?.societyId as string | undefined
          if (societyId) {
            request.query = { ...request.query, 'filters.id': societyId }
          }
          return Promise.resolve(request)
        },
      },
    },
    properties: {
      id:     { isTitle: true },
      status: { isRequired: true },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
