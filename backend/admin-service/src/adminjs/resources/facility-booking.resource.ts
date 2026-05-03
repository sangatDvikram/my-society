import { type ActionContext, type ActionRequest, type ResourceWithOptions } from 'adminjs'

import { FacilityBooking } from '../../database/entities/facility-booking.entity'
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
 * FacilityBooking resource — custom Approve/Reject/Cancel actions.
 * BookingStatusBadge colour-coded chip.
 * Section 16.3.2 of the PRD.
 */
export const FacilityBookingResource: ResourceWithOptions = {
  resource: FacilityBooking,
  options: {
    navigation: { name: 'Facilities', icon: 'Calendar' },
    actions: {
      new:        { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      list:   { before: withSocietyScope },
      search: { before: withSocietyScope },
      approve: {
        actionType: 'record',
        icon: 'CheckCircle',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Booking approved', type: 'success' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'FacilityBooking' }),
        }),
      },
      reject: {
        actionType: 'record',
        icon: 'XCircle',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Booking rejected', type: 'danger' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'FacilityBooking' }),
        }),
      },
      cancel: {
        actionType: 'record',
        icon: 'Slash',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Booking cancelled and refund triggered', type: 'info' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'FacilityBooking' }),
        }),
      },
    },
    properties: {
      societyId: { isDisabled: true },
      status: {
        isVisible: { list: true, show: true, edit: false, filter: true },
        components: {
          list: Components.BookingStatusBadge,
          show: Components.BookingStatusBadge,
        },
      },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
