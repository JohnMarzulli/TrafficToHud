"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBytes = exports.isCrcValid = exports.crc16 = exports.getChecksum = exports.escapeData = exports.unescapeData = void 0;
/**
 * Remove escape sequences from data.
 * @param data The data that may be escaped.
 * @returns Unescaped data.
 */
function unescapeData(data) {
    var escapeByte = 0x7D;
    var xorByte = 0x20;
    var result = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i] === escapeByte && i + 1 < data.length) {
            result.push(data[i + 1] ^ xorByte);
            i++;
        }
        else {
            result.push(data[i]);
        }
    }
    return new Uint8Array(result);
}
exports.unescapeData = unescapeData;
/**
 * Apply GDL90 byte-stuffing to data so it can be safely
 * placed between flag bytes. Inverse of unescapeData.
 * @param data The data to escape.
 * @returns Escaped data.
 */
function escapeData(data) {
    var flagByte = 0x7E;
    var escapeByte = 0x7D;
    var xorByte = 0x20;
    var result = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i] === flagByte || data[i] === escapeByte) {
            result.push(escapeByte);
            result.push(data[i] ^ xorByte);
        }
        else {
            result.push(data[i]);
        }
    }
    return new Uint8Array(result);
}
exports.escapeData = escapeData;
/**
 * Given a piece of data, calculate the checksum
 * @param data The data to calculate the checksum for.
 * @returns The checksum of the data.
 */
function getChecksum(data) {
    return data.reduce(function (checksum, byte) { return checksum ^ byte; }, 0);
}
exports.getChecksum = getChecksum;
// CRC-16/CCITT table, per the GDL90 spec (Appendix B).
var crc16Table = (function () {
    var table = new Uint16Array(256);
    for (var i = 0; i < 256; i++) {
        var crc = i << 8;
        for (var bit = 0; bit < 8; bit++) {
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
function crc16(data) {
    var crc = 0;
    for (var i = 0; i < data.length; i++) {
        crc = (crc16Table[crc >> 8] ^ (crc << 8) ^ data[i]) & 0xFFFF;
    }
    return crc;
}
exports.crc16 = crc16;
/**
 * Validate the trailing CRC-16 of a GDL90 message.
 * @param message The full, unescaped GDL90 message, including the leading and trailing 0x7E flag bytes.
 * @returns True if the message's CRC-16 matches its contents.
 */
function isCrcValid(message) {
    var end = message.length - 1; // index of the trailing 0x7E flag byte
    if (end < 3) {
        return false;
    }
    var crcLow = message[end - 2];
    var crcHigh = message[end - 1];
    var receivedCrc = crcLow | (crcHigh << 8);
    var computedCrc = crc16(message.subarray(1, end - 2));
    return computedCrc === receivedCrc;
}
exports.isCrcValid = isCrcValid;
/**
 * Given a string, turn it into bytes.
 * @param report The string to turn into a byte array.
 * @returns The byte array version of the string.
 */
function getBytes(report) {
    var decodedBytes = new Uint8Array(report.length);
    for (var i = 0; i < report.length; i++) {
        decodedBytes[i] = report.charCodeAt(i);
    }
    return decodedBytes;
}
exports.getBytes = getBytes;
//# sourceMappingURL=data-handling.js.map