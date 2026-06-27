"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeAirmet = exports.decodeGenericText = exports.dlacDecode = void 0;
/**
 * Decode a piece of DLAC data per the ADS-B specification
 * @param data The data to decode.
 * @returns The decoded text.
 */
function dlacDecode(data) {
    var dlacAlpha = "\x03ABCDEFGHIJKLMNOPQRSTUVWXYZ\x1A\t\x1E\n| !\"#$%&'()*+,-./0123456789:;<=>?";
    var step = 0;
    var tab = false;
    var ret = "";
    for (var i = 0; i < data.length; i++) {
        var ch = 0;
        switch (step) {
            case 0:
                ch = data[i + 0] >> 2;
                break;
            case 1:
                ch = (((data[i - 1]) & 0x03) << 4) | ((data[i + 0]) >> 4);
                break;
            case 2:
                ch = (((data[i - 1]) & 0x0f) << 2) | ((data[i + 0]) >> 6);
                --i;
                break;
            case 3:
                ch = (data[i + 0]) & 0x3f;
                break;
        }
        if (tab) {
            while (ch > 0) {
                ret += " ";
                ch--;
            }
            tab = false;
        }
        else if (ch == 28) { // tab
            tab = true;
        }
        else {
            ret += dlacAlpha[ch];
        }
        step = (step + 1) % 4;
    }
    return ret;
}
exports.dlacDecode = dlacDecode;
/**
 * Decode a GENERIC text weather product.
 * @param data The DLAC encoded generic text product.
 * @returns Human readable text.
 */
function decodeGenericText(data) {
    var textData = dlacDecode(data);
    console.log("    GENERIC TEXT: textData=" + textData);
    return textData;
}
exports.decodeGenericText = decodeGenericText;
/**
 * Decode an AIRMET from DLAC encoding.
 * @param data The DLAC encoded data
 * @returns A human readable AIRMET
 */
function decodeAirmet(data) {
    var recordFormat = ((data[0]) & 0xF0) >> 4;
    var productVersion = ((data[0]) & 0x0F);
    var recordCount = ((data[1]) & 0xF0) >> 4;
    var locationIdentifier = dlacDecode(data.subarray(2, 5));
    var recordReference = ((data[5])); //FIXME: Special values. 0x00 means "use location_identifier". 0xFF means "use different reference". (4-3).
    if (recordFormat == 2) {
        var recordLength = ((data[6]) << 8) | (data[7]);
        if ((data.length - recordLength) < 6) {
            console.error("FISB record not long enough: recordLength=" + recordLength + ", data.length=" + data.length);
            return null;
        }
        // Report identifier = report number + report year.
        var reportNumber = ((data[8]) << 6) | (((data[9]) & 0xFC) >> 2);
        var reportYear = (((data[9]) & 0x03) << 5) | (((data[10]) & 0xF8) >> 3);
        var reportStatus = ((data[10]) & 0x04) >> 2; //TODO: 0 = cancelled, 1 = active.
        var textDataLength = recordLength - 5;
        var textData = dlacDecode(data.subarray(11, 11 + textDataLength - 1));
        console.log("    AIRMET: recordFormat=" + recordFormat + ", productVersion=" + productVersion + ", recordCount=" + recordCount + ", locationIdentifier=" + locationIdentifier + ", recordReference=" + recordReference + ", recordLength=" + recordLength + ", reportNumber=" + reportNumber + ", reportYear=" + reportYear + ", reportStatus=" + reportStatus + ", textDataLength=" + textDataLength + ", textData=" + textData);
        return textData;
    }
    else {
        console.error("Unknown format=" + recordFormat);
    }
    console.log("    AIRMET: recordFormat=" + recordFormat + ", productVersion=" + productVersion + ", recordCount=" + recordCount + ", locationIdentifier=" + locationIdentifier + ", recordReference=" + recordReference);
    return null;
}
exports.decodeAirmet = decodeAirmet;
//# sourceMappingURL=airmet.js.map