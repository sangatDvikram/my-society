import { type AdminModuleOptions } from '@adminjs/nestjs'
import { ComponentLoader } from 'adminjs'

import { AuditReportResource }     from './resources/audit-report.resource'
import { BankAccountResource }     from './resources/bank-account.resource'
import { CommonFacilityResource }  from './resources/common-facility.resource'
import { EventMediaResource }      from './resources/event-media.resource'
import { FacilityBookingResource } from './resources/facility-booking.resource'
import { FlatRentalResource }      from './resources/flat-rental.resource'
import { FlatResource }            from './resources/flat.resource'
import { MediaAssetResource }      from './resources/media-asset.resource'
import { PaymentResource }         from './resources/payment.resource'
import { SocietyEventResource }    from './resources/society-event.resource'
import { SocietyResource }        from './resources/society.resource'
import { TenantProfileResource }   from './resources/tenant-profile.resource'
import { UserResource }            from './resources/user.resource'
import { VendorProfileResource }   from './resources/vendor-profile.resource'
import { VisitorLogResource }      from './resources/visitor-log.resource'

/**
 * ComponentLoader — registers custom React components for AdminJS bundling.
 * Section 16.5 of the PRD.
 */
export const componentLoader = new ComponentLoader()

export const Components = {
  PhoneDisplay:       componentLoader.add('PhoneDisplay',       './components/PhoneDisplay'),
  PanDisplay:         componentLoader.add('PanDisplay',         './components/PanDisplay'),
  BookingStatusBadge: componentLoader.add('BookingStatusBadge', './components/BookingStatusBadge'),
  EventStatusBadge:   componentLoader.add('EventStatusBadge',   './components/EventStatusBadge'),
}

type AdminUser = {
  id: string
  email: string
  societyId: string
  role: string
}

/**
 * Build AdminJS module options for the Society Admin panel.
 *
 * @param sessionSecret  - Express-session signing secret (env: ADMINJS_SESSION_SECRET)
 * @param cookiePassword - AdminJS cookie encryption secret (env: ADMINJS_COOKIE_SECRET)
 *
 * TODO (Section 16.8): Audit logging — inject DataSource and add per-action
 * `after` hooks on edit/new/delete/bulkDelete to write to admin_audit_logs.
 */
export function buildAdminJsOptions(
  sessionSecret: string,
  cookiePassword: string,
): AdminModuleOptions {
  return {
    adminJsOptions: {
      rootPath: '/panel',
      componentLoader,
      branding: {
        companyName: 'My Society — Admin Panel',
        favicon: '/favicon.ico',
        withMadeWithLove: false,
      },
      resources: [
        SocietyResource,
        FlatResource,
        UserResource,
        PaymentResource,
        VisitorLogResource,
        BankAccountResource,
        FlatRentalResource,
        TenantProfileResource,
        CommonFacilityResource,
        FacilityBookingResource,
        VendorProfileResource,
        SocietyEventResource,
        EventMediaResource,
        AuditReportResource,
        MediaAssetResource,
      ],
    },

    auth: {
      /**
       * Society Admin auth: validate JWT issued by the API gateway.
       * The JWT sub is used as email here; societyId comes from claims.
       */
      authenticate: (email: string, password: string): Promise<AdminUser | null> => {
        // Stub: real implementation will verify JWT via api-gateway
        // In production, accept the JWT token as the password field
        void password
        if (!email) return Promise.resolve(null)
        return Promise.resolve({
          id:       email,
          email,
          societyId: '',
          role:     'ADMIN',
        })
      },
      cookieName:     'adminjs-panel',
      cookiePassword,
    },

    sessionOptions: {
      resave:           false,
      saveUninitialized: false,
      secret:           sessionSecret,
      cookie: {
        httpOnly:  true,
        secure:    process.env['NODE_ENV'] === 'production',
        sameSite:  'strict' as const,
        maxAge:    8 * 60 * 60 * 1000, // 8 hours
      },
    },
  }
}


