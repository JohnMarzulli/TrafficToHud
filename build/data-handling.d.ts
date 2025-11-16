/**
 * Remove escape sequences from data.
 * @param data The data that may be escaped.
 * @returns Unescaped data.
 */
export declare function unescapeData(data: Uint8Array): Uint8Array;
/**
 * Given a piece of data, calculate the checksum
 * @param data The data to calculate the checksum for.
 * @returns The checksum of the data.
 */
export declare function getChecksum(data: Uint8Array): number;
/**
 * Given a string, turn it into bytes.
 * @param report The string to turn into a byte array.
 * @returns The byte array version of the string.
 */
export declare function getBytes(report: string): Uint8Array;
