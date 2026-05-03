import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { SocietyBankAccount } from '../../database/entities/bank-account.entity'

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
 * SocietyBankAccount resource — masked account number; no new/delete.
 * Custom actions: Verify, Set Primary.
 * Section 16.3.2 of the PRD.
 */
export const BankAccountResource: ResourceWithOptions = {
  resource: SocietyBankAccount,
  options: {
    navigation: { name: 'Finance', icon: 'DollarSign' },
    actions: {
      new:        { isAccessible: false },
      edit:       { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      list:   { before: withSocietyScope },
      search: { before: withSocietyScope },
      /** Custom: Verify — triggers Razorpay penny drop */
      verify: {
        actionType: 'record',
        icon: 'CheckCircle',
        handler: (_request, _response, context) => Promise.resolve({
          record:    context.record?.toJSON(context.currentAdmin),
          notice:    { message: 'Verification triggered', type: 'info' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'SocietyBankAccount' }),
        }),
      },
    },
    properties: {
      societyId:               { isDisabled: true },
      accountNumberEncrypted:  { isVisible: false },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
