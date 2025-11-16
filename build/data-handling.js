"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBytes = exports.getChecksum = exports.unescapeData = void 0;
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
 * Given a piece of data, calculate the checksum
 * @param data The data to calculate the checksum for.
 * @returns The checksum of the data.
 */
function getChecksum(data) {
    return data.reduce(function (checksum, byte) { return checksum ^ byte; }, 0);
}
exports.getChecksum = getChecksum;
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