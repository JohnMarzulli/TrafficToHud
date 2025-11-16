"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeDlac = void 0;
var DLACMode;
(function (DLACMode) {
    DLACMode[DLACMode["UPPER"] = 0] = "UPPER";
    DLACMode[DLACMode["LOWER"] = 1] = "LOWER";
    DLACMode[DLACMode["FIGURE"] = 2] = "FIGURE";
    DLACMode[DLACMode["PUNCT"] = 3] = "PUNCT";
    DLACMode[DLACMode["CTRL"] = 4] = "CTRL";
    DLACMode[DLACMode["BINARY"] = 5] = "BINARY";
})(DLACMode || (DLACMode = {}));
// DLAC character tables (RTCA DO-282B)
var DLAC_TABLES = (_a = {},
    _a[DLACMode.UPPER] = [
        ' ', 'A', 'B', 'C', 'D', 'E', 'F', 'G',
        'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
        'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
        'X', 'Y', 'Z', '\x1b', '\x1c', '\x1d', '\x1e', '\x1f'
    ],
    _a[DLACMode.LOWER] = [
        ' ', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
        'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
        'p', 'q', 'r', 's', 't', 'u', 'v', 'w',
        'x', 'y', 'z', '\x1b', '\x1c', '\x1d', '\x1e', '\x1f'
    ],
    _a[DLACMode.FIGURE] = [
        ' ', '0', '1', '2', '3', '4', '5', '6',
        '7', '8', '9', '&', '\r', '\t', ',', ':',
        '#', '-', '.', '$', '/', '+', '%', '*',
        '=', '^', '(', ')', '[', ']', '{', '}'
    ],
    _a[DLACMode.PUNCT] = [
        ' ', ';', '<', '>', '@', '\\', '\'', '"',
        '!', '?', '|', '~', '`', '_', '.', ',',
        '{', '}', '[', ']', '(', ')', '-', '=',
        '^', '+', '*', '/', ':', '#', '$', '%'
    ],
    _a);
// Extract 6-bit tokens from a byte stream
function extract6bitTokens(input) {
    var tokens = [];
    var bitBuffer = 0;
    var bitCount = 0;
    for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
        var byte = input_1[_i];
        bitBuffer = (bitBuffer << 8) | byte;
        bitCount += 8;
        while (bitCount >= 6) {
            bitCount -= 6;
            tokens.push((bitBuffer >> bitCount) & 0x3F);
        }
    }
    return tokens;
}
function decodeDlac(tokens) {
    var mode = DLACMode.UPPER;
    var output = '';
    var shiftOnce = false;
    var binaryCount = 0;
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (mode === DLACMode.BINARY) {
            output += String.fromCharCode(token);
            binaryCount--;
            if (binaryCount === 0)
                mode = DLACMode.UPPER;
            continue;
        }
        // Handle control values
        if (token >= 0x1b && token <= 0x1f) {
            switch (token) {
                case 0x1b:
                    shiftOnce = true;
                    mode = DLACMode.LOWER;
                    break;
                case 0x1c:
                    shiftOnce = true;
                    mode = DLACMode.FIGURE;
                    break;
                case 0x1d:
                    shiftOnce = true;
                    mode = DLACMode.PUNCT;
                    break;
                case 0x1e:
                    mode = DLACMode.CTRL;
                    break;
                case 0x1f:
                    if (i + 1 < tokens.length) {
                        binaryCount = tokens[++i];
                        mode = DLACMode.BINARY;
                    }
                    break;
            }
            continue;
        }
        // Control mode (restore upper)
        if (mode === DLACMode.CTRL) {
            mode = DLACMode.UPPER;
            continue;
        }
        var charTable = DLAC_TABLES[mode];
        output += charTable ? charTable[token] || '?' : '?';
        // Reset mode if shift was temporary
        if (shiftOnce) {
            mode = DLACMode.UPPER;
            shiftOnce = false;
        }
    }
    return output;
}
exports.decodeDlac = decodeDlac;
//# sourceMappingURL=dlac-decode.js.map