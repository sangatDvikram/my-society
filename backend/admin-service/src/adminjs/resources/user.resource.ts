import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { User } from '../../database/entities/user.entity'
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
 * User resource — read-only; phone displayed via PhoneDisplay component.
 * Section 16.3.2 & 16.5 of the PRD.
 */
export const UserResource: ResourceWithOptions = {
  resource: User,
  options: {
    navigation: { name: 'Users', icon: 'User' },
    actions: {
      new:        { isAccessible: false },
      edit:       { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      list:   { before: withSocietyScope },
      search: { before: withSocietyScope },
    },
    properties: {
      societyId: { isDisabled: true },
      phoneEncrypted: {
        isVisible: { list: true, show: true, edit: false, filter: false },
        components: {
          list: Components.PhoneDisplay,
          show: Components.PhoneDisplay,
        },
      },
      phoneHash: { isVisible: false },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
