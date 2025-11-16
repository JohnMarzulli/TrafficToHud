/**
 * Decode a piece of DLAC data per the ADS-B specification
 * @param data The data to decode.
 * @returns The decoded text.
 */
export declare function dlacDecode(data: Uint8Array): string;
/**
 * Decode a GENERIC text weather product.
 * @param data The DLAC encoded generic text product.
 * @returns Human readable text.
 */
export declare function decodeGenericText(data: Uint8Array): string;
/**
 * Decode an AIRMET from DLAC encoding.
 * @param data The DLAC encoded data
 * @returns A human readable AIRMET
 */
export declare function decodeAirmet(data: Uint8Array): string | null;
