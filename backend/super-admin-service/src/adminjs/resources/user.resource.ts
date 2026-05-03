import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { User } from '../../database/entities/user.entity'
import { Components } from '../adminjs.options'

/**
 * User resource — cross-society; no Delete (GDPR soft-delete); phone via PhoneDisplay.
 * Section 16.3.1 of the PRD.
 */
export const UserResource: ResourceWithOptions = {
  resource: User,
  options: {
    navigation: { name: 'Platform', icon: 'User' },
    actions: {
      new:        { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      show: {
        before: (request: ActionRequest, _context: ActionContext): Promise<ActionRequest> =>
          Promise.resolve(request),
      },
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
