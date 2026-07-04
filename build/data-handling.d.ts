/**
 * Remove escape sequences from data.
 * @param data The data that may be escaped.
 * @returns Unescaped data.
 */
export declare function unescapeData(data: Uint8Array): Uint8Array;
/**
 * Apply GDL90 byte-stuffing to data so it can be safely
 * placed between flag bytes. Inverse of unescapeData.
 * @param data The data to escape.
 * @returns Escaped data.
 */
export declare function escapeData(data: Uint8Array): Uint8Array;
/**
 * Given a piece of data, calculate the checksum
 * @param data The data to calculate the checksum for.
 * @returns The checksum of the data.
 */
export declare function getChecksum(data: Uint8Array): number;
/**
 * Calculate the GDL90 CRC-16 of a piece of data.
 * @param data The data to calculate the CRC for.
 * @returns The CRC-16 of the data.
 */
export declare function crc16(data: Uint8Array): number;
/**
 * Validate the trailing CRC-16 of a GDL90 message.
 * @param message The full, unescaped GDL90 message, including the leading and trailing 0x7E flag bytes.
 * @returns True if the message's CRC-16 matches its contents.
 */
export declare function isCrcValid(message: Uint8Array): boolean;
/**
 * Given a string, turn it into bytes.
 * @param report The string to turn into a byte array.
 * @returns The byte array version of the string.
 */
export declare function getBytes(report: string): Uint8Array;
