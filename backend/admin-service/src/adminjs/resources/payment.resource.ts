import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { Payment } from '../../database/entities/payment.entity'

/**
 * Payment resource — read-only; tenant-scoped; signatures never exposed.
 * Section 16.3.2 & 16.4.2 & 16.9 of the PRD.
 */
export const PaymentResource: ResourceWithOptions = {
  resource: Payment,
  options: {
    navigation: { name: 'Finance', icon: 'CreditCard' },
    actions: {
      new:        { isAccessible: false },
      edit:       { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      list: {
        before: (request: ActionRequest, context: ActionContext): Promise<ActionRequest> => {
          const societyId = context.currentAdmin?.societyId as string | undefined
          if (societyId) {
            request.query = { ...request.query, 'filters.societyId': societyId }
          }
          return Promise.resolve(request)
        },
      },
    },
    properties: {
      societyId:         { isDisabled: true },
      razorpaySignature: { isVisible: false },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
