"use strict";

/**
 * Remove escape sequences from data.
 * @param data The data that may be escaped.
 * @returns Unescaped data.
 */
export function unescapeData(
    data: Uint8Array
): Uint8Array {
    const escapeByte = 0x7D;
    const xorByte = 0x20;
    const result: number[] = [];

    for (let i = 0; i < data.length; i++) {
        if (data[i] === escapeByte && i + 1 < data.length) {
            result.push(data[i + 1] ^ xorByte);
            i++;
        } else {
            result.push(data[i]);
        }
    }

    return new Uint8Array(result);
}

/**
 * Given a piece of data, calculate the checksum
 * @param data The data to calculate the checksum for.
 * @returns The checksum of the data.
 */
export function getChecksum(
    data: Uint8Array
): number {
    return data.reduce((checksum, byte) => checksum ^ byte, 0);
}

/**
 * Given a string, turn it into bytes.
 * @param report The string to turn into a byte array.
 * @returns The byte array version of the string.
 */
export function getBytes(
    report: string
): Uint8Array {
    const decodedBytes = new Uint8Array(report.length);

    for (let i = 0; i < report.length; i++) {
        decodedBytes[i] = report.charCodeAt(i);
    }

    return decodedBytes;
}