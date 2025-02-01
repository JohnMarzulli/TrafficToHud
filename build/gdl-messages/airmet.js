"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeAirmet = exports.decodeGenericText = exports.dlacDecode = void 0;
function dlacDecode(data) {
    var dlacAlpha = "\x03ABCDEFGHIJKLMNOPQRSTUVWXYZ\x1A\t\x1E\n| !\"#$%&'()*+,-./0123456789:;<=>?";
    var step = 0;
    var tab = false;
    var ret = "";
    for (var i = 0; i < data.length; i++) {
        var ch = void 0;
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
function decodeGenericText(data) {
    var text_data = dlacDecode(data);
    console.log("    GENERIC TEXT: text_data=" + text_data);
}
exports.decodeGenericText = decodeGenericText;
function decodeAirmet(data) {
    var record_format = ((data[0]) & 0xF0) >> 4;
    var product_version = ((data[0]) & 0x0F);
    var record_count = ((data[1]) & 0xF0) >> 4;
    var location_identifier = dlacDecode(data.subarray(2, 5));
    var record_reference = ((data[5])); //FIXME: Special values. 0x00 means "use location_identifier". 0xFF means "use different reference". (4-3).
    if (record_format == 2) {
        var record_length = ((data[6]) << 8) | (data[7]);
        if ((data.length - record_length) < 6) {
            console.error("FISB record not long enough: record_length=" + record_length + ", data.length=" + data.length);
            return;
        }
        // Report identifier = report number + report year.
        var report_number = ((data[8]) << 6) | (((data[9]) & 0xFC) >> 2);
        var report_year = (((data[9]) & 0x03) << 5) | (((data[10]) & 0xF8) >> 3);
        var report_status = ((data[10]) & 0x04) >> 2; //TODO: 0 = cancelled, 1 = active.
        var text_data_len = record_length - 5;
        var text_data = dlacDecode(data.subarray(11, 11 + text_data_len - 1));
        console.log("    AIRMET: record_format=" + record_format + ", product_version=" + product_version + ", record_count=" + record_count + ", location_identifier=" + location_identifier + ", record_reference=" + record_reference + ", record_length=" + record_length + ", report_number=" + report_number + ", report_year=" + report_year + ", report_status=" + report_status + ", text_data_len=" + text_data_len + ", text_data=" + text_data);
    }
    else {
        console.error("Unknown format=" + record_format);
    }
    console.log("    AIRMET: record_format=" + record_format + ", product_version=" + product_version + ", record_count=" + record_count + ", location_identifier=" + location_identifier + ", record_reference=" + record_reference);
}
exports.decodeAirmet = decodeAirmet;
//# sourceMappingURL=airmet.js.map