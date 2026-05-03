import { type ResourceWithOptions } from 'adminjs'

import { Payment } from '../../database/entities/payment.entity'

/**
 * Payment resource — cross-society read-only; filter by society, FY, status.
 * Section 16.3.1 of the PRD.
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
    },
    properties: {
      societyId:         { isDisabled: true },
      razorpaySignature: { isVisible: false },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
