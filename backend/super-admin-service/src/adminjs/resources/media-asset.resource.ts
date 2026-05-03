import { type ResourceWithOptions } from 'adminjs'

import { MediaAsset } from '../../database/entities/media-asset.entity'

/**
 * MediaAsset resource — cross-society; Invalidate Cache custom action.
 * Section 16.3.1 of the PRD.
 */
export const MediaAssetResource: ResourceWithOptions = {
  resource: MediaAsset,
  options: {
    navigation: { name: 'Media', icon: 'Image' },
    actions: {
      new:        { isAccessible: false },
      edit:       { isAccessible: false },
      delete:     { isAccessible: false },
      bulkDelete: { isAccessible: false },
      invalidateCache: {
        actionType: 'record',
        icon: 'RefreshCw',
        handler: (_request, _response, context) => Promise.resolve({
          record:  context.record?.toJSON(context.currentAdmin),
          notice:  { message: 'Variant cache cleared; next request will regenerate', type: 'success' },
          redirectUrl: context.h.resourceUrl({ resourceId: 'MediaAsset' }),
        }),
      },
    },
    properties: {
      societyId: { isDisabled: true },
      variants:  { isVisible: false },
    },
    sort: { sortBy: 'createdAt', direction: 'desc' },
  },
}
