"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBytes = exports.calculateChecksum = exports.unescapeData = void 0;
function unescapeData(data) {
    var ESCAPE_BYTE = 0x7D;
    var XOR_BYTE = 0x20;
    var result = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i] === ESCAPE_BYTE && i + 1 < data.length) {
            result.push(data[i + 1] ^ XOR_BYTE);
            i++;
        }
        else {
            result.push(data[i]);
        }
    }
    return new Uint8Array(result);
}
exports.unescapeData = unescapeData;
function calculateChecksum(data) {
    return data.reduce(function (checksum, byte) { return checksum ^ byte; }, 0);
}
exports.calculateChecksum = calculateChecksum;
function getBytes(report) {
    var decodedBytes = new Uint8Array(report.length);
    for (var i = 0; i < report.length; i++) {
        decodedBytes[i] = report.charCodeAt(i);
    }
    return decodedBytes;
}
exports.getBytes = getBytes;
//# sourceMappingURL=data_handling.js.map