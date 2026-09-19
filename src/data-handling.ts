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
 * Apply GDL90 byte-stuffing to data so it can be safely
 * placed between flag bytes. Inverse of unescapeData.
 * @param data The data to escape.
 * @returns Escaped data.
 */
export function escapeData(
    data: Uint8Array
): Uint8Array {
    const flagByte = 0x7E;
    const escapeByte = 0x7D;
    const xorByte = 0x20;
    const result: number[] = [];

    for (let i = 0; i < data.length; i++) {
        if (data[i] === flagByte || data[i] === escapeByte) {
            result.push(escapeByte);
            result.push(data[i] ^ xorByte);
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

// CRC-16/CCITT table, per the GDL90 spec (Appendix B).
const crc16Table: Uint16Array = (() => {
    const table = new Uint16Array(256);

    for (let i = 0; i < 256; i++) {
        let crc = i << 8;

        for (let bit = 0; bit < 8; bit++) {
            crc = ((crc << 1) ^ ((crc & 0x8000) ? 0x1021 : 0)) & 0xFFFF;
        }

        table[i] = crc;
    }

    return table;
})();

/**
 * Calculate the GDL90 CRC-16 of a piece of data.
 * @param data The data to calculate the CRC for.
 * @returns The CRC-16 of the data.
 */
export function crc16(
    data: Uint8Array
): number {
    let crc = 0;

    for (let i = 0; i < data.length; i++) {
        crc = (crc16Table[crc >> 8] ^ (crc << 8) ^ data[i]) & 0xFFFF;
    }

    return crc;
}

/**
 * Validate the trailing CRC-16 of a GDL90 message.
 * @param message The full, unescaped GDL90 message, including the leading and trailing 0x7E flag bytes.
 * @returns True if the message's CRC-16 matches its contents.
 */
export function isCrcValid(
    message: Uint8Array
): boolean {
    const end = message.length - 1; // index of the trailing 0x7E flag byte

    if (end < 3) {
        return false;
    }

    const crcLow = message[end - 2];
    const crcHigh = message[end - 1];
    const receivedCrc = crcLow | (crcHigh << 8);
    const computedCrc = crc16(message.subarray(1, end - 2));

    return computedCrc === receivedCrc;
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