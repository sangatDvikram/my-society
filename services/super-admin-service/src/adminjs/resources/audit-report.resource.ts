import { type ResourceWithOptions } from 'adminjs'

import { AuditReport } from '../../database/entities/audit-report.entity'

/**
 * AuditReport resource — cross-society; Super Admin can publish/archive reports.
 * Section 16.3.1 of the PRD.
 */
export const AuditReportResource: ResourceWithOptions = {
  resource: AuditReport,
  options: {
    navigation: { name: 'Finance', icon: 'FileText' },
    actions: {
      new:        { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
    },
    properties: {
      societyId: { isDisabled: true },
      objectKey: { isVisible: false },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
