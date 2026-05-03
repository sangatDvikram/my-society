import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { AuditReport } from '../../database/entities/audit-report.entity'

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
 * AuditReport resource — own society; Admin can edit status (publish/archive).
 * Section 16.3.2 of the PRD.
 */
export const AuditReportResource: ResourceWithOptions = {
  resource: AuditReport,
  options: {
    navigation: { name: 'Finance', icon: 'FileText' },
    actions: {
      new:        { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      list:   { before: withSocietyScope },
      search: { before: withSocietyScope },
    },
    properties: {
      societyId: { isDisabled: true },
      objectKey: { isVisible: false },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
