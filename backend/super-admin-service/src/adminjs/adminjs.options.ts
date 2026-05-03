import { type AdminModuleOptions } from '@adminjs/nestjs'
import { ComponentLoader } from 'adminjs'

import { AuditReportResource }     from './resources/audit-report.resource'
import { BankAccountResource }     from './resources/bank-account.resource'
import { CommonFacilityResource }  from './resources/common-facility.resource'
import { EventMediaResource }      from './resources/event-media.resource'
import { FacilityBookingResource } from './resources/facility-booking.resource'
import { FeatureFlagResource }     from './resources/feature-flag.resource'
import { FlatRentalResource }      from './resources/flat-rental.resource'
import { FlatResource }            from './resources/flat.resource'
import { MediaAssetResource }      from './resources/media-asset.resource'
import { PaymentResource }         from './resources/payment.resource'
import { SocietyEventResource }    from './resources/society-event.resource'
import { SocietyResource }        from './resources/society.resource'
import { TenantProfileResource }   from './resources/tenant-profile.resource'
import { UserResource }            from './resources/user.resource'
import { VendorProfileResource }   from './resources/vendor-profile.resource'

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
  Dashboard:          componentLoader.add('Dashboard',          './dashboard/dashboard.component'),
}

type AdminUser = {
  id: string
  email: string
  role: string
}

/**
 * Build AdminJS module options for the Super Admin panel.
 *
 * @param sessionSecret      - Express-session signing secret (env: ADMINJS_SESSION_SECRET)
 * @param cookiePassword     - AdminJS cookie encryption secret (env: ADMINJS_COOKIE_SECRET)
 * @param superAdminEmail    - Expected super admin email (env: SUPER_ADMIN_EMAIL)
 * @param superAdminPassword - Expected super admin password (env: SUPER_ADMIN_PASSWORD)
 *
 * TODO (Section 16.8): Audit logging — inject DataSource and add per-action
 * `after` hooks on edit/new/delete/bulkDelete to write to admin_audit_logs.
 */
export function buildAdminJsOptions(
  sessionSecret: string,
  cookiePassword: string,
  superAdminEmail: string,
  superAdminPassword: string,
): AdminModuleOptions {
  return {
    adminJsOptions: {
      rootPath: '/superadmin',
      componentLoader,
      branding: {
        companyName: 'My Society — Super Admin',
        favicon: '/favicon.ico',
        withMadeWithLove: false,
      },
      resources: [
        SocietyResource,
        UserResource,
        FlatResource,
        PaymentResource,
        AuditReportResource,
        FeatureFlagResource,
        BankAccountResource,
        FlatRentalResource,
        TenantProfileResource,
        CommonFacilityResource,
        FacilityBookingResource,
        VendorProfileResource,
        SocietyEventResource,
        EventMediaResource,
        MediaAssetResource,
      ],
      dashboard: {
        component: Components.Dashboard,
      },
    },

    auth: {
      /**
       * Super Admin auth: Email + password (+ TOTP enforced separately).
       * Section 16.7 of the PRD.
       */
      authenticate: (email: string, password: string): Promise<AdminUser | null> => {
        if (email !== superAdminEmail || password !== superAdminPassword) return Promise.resolve(null)
        return Promise.resolve({ id: email, email, role: 'SUPER_ADMIN' })
      },
      cookieName:     'adminjs-superadmin',
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


