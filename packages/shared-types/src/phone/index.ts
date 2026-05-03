/**
 * @society/shared-types — Phone domain
 *
 * Types for the dual-column phone storage pattern:
 *   - `phoneHash`      — HMAC-SHA256 of the E.164 phone; used for DB lookups
 *   - `phoneEncrypted` — AES-256-GCM ciphertext; used for display / GDPR export
 *
 * Neither column ever contains the raw plaintext phone number.
 */

/**
 * Branded string alias representing a phone number already normalised to E.164
 * format (`+919876543210`). Produced by `PhoneCryptoService.normaliseE164()`.
 * Using a brand prevents accidentally passing un-normalised phones into crypto
 * functions.
 */
export type E164Phone = string & { readonly _brand: 'E164Phone' }

/**
 * The pair of columns written to the database for every phone number field.
 *
 * | Column          | Type        | Purpose                              |
 * |-----------------|-------------|--------------------------------------|
 * | `phoneHash`     | VARCHAR(64) | Deterministic; allows `WHERE` lookup |
 * | `phoneEncrypted`| BYTEA/text  | Reversible; decrypted for display    |
 */
export interface PhoneFields {
  phoneHash: string
  phoneEncrypted: string
}
