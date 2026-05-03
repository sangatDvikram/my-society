import { type ResourceWithOptions } from 'adminjs'

import { SocietyBankAccount } from '../../database/entities/bank-account.entity'

/**
 * SocietyBankAccount resource — cross-society; masked account; custom Verify action.
 * Section 16.3.1 of the PRD.
 */
export const BankAccountResource: ResourceWithOptions = {
  resource: SocietyBankAccount,
  options: {
    navigation: { name: 'Finance', icon: 'DollarSign' },
    actions: {
      new:        { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      verify: {
        actionType: 'record',
        icon: 'CheckCircle',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Verification triggered', type: 'info' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'SocietyBankAccount' }),
        }),
      },
    },
    properties: {
      societyId:              { isDisabled: true },
      accountNumberEncrypted: { isVisible: false },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
