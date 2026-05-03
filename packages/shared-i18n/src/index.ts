/**
 * @society/shared-i18n
 *
 * Shared i18next translation strings for English (en), Hindi (hi), and Marathi (mr).
 * Translation JSON files live under src/locales/<lang>/<namespace>.json
 * and are exported here as typed objects.
 *
 * This file is a stub — add locale JSON files and re-export them here as
 * the internationalisation content grows (EPIC-20).
 */

export const SUPPORTED_LOCALES = ['en', 'hi', 'mr'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';
