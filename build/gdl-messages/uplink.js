"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodePayloadFromSample = exports.Uplink = exports.UatUplinkFrame = void 0;
var console_1 = require("console");
var logging_object_1 = require("../logging-object");
var boundaries_1 = require("../types/boundaries");
var coordinate_1 = require("../types/coordinate");
var nexrad_1 = require("../weather/nexrad");
var text_report_1 = require("../weather/text-report");
var text_reports_1 = require("../weather/text-reports");
var airmet_1 = require("./airmet");
var decoded_gdl90_message_1 = require("./decoded-gdl90-message");
// References:
// https://www.faa.gov/sites/faa.gov/files/air_traffic/technology/adsb/archival/GDL90_Public_ICD_RevA.PDF
// https://phd-sid.ethz.ch/debian/stratux/stratux-1.5b2/notes/SBS-Description-Doc_SRT_47_rev01_20111024.pdf
// https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-149B.pdf
// https://www.faa.gov/documentlibrary/media/advisory_circular/ac_00-45h.pdf
function getFisbProductName(productId) {
    switch (productId) {
        case 0:
        case 20: return "METAR and SPECI";
        case 1:
        case 21: return "TAF and Amended TAF";
        case 2:
        case 22: return "SIGMET";
        case 3:
        case 23: return "Convective SIGMET";
        case 4:
        case 24: return "AIRMET";
        case 5:
        case 25: return "PIREP";
        case 6:
        case 26: return "AWW";
        case 7:
        case 27: return "Winds and Temperatures Aloft";
        case 8: return "NOTAM (Including TFRs) and Service Status";
        case 9: return "Aerodrome and Airspace – D-ATIS";
        case 10: return "Aerodrome and Airspace - TWIP";
        case 11: return "Aerodrome and Airspace - AIRMET";
        case 12: return "Aerodrome and Airspace - SIGMET/Convective SIGMET";
        case 13: return "Aerodrome and Airspace - SUA Status";
        case 51: return "National NEXRAD, Type 0 - 4 level";
        case 52: return "National NEXRAD, Type 1 - 8 level (quasi 6-level VIP)";
        case 53: return "National NEXRAD, Type 2 - 8 level";
        case 54: return "National NEXRAD, Type 3 - 16 level";
        case 55: return "Regional NEXRAD, Type 0 - low dynamic range";
        case 56: return "Regional NEXRAD, Type 1 - 8 level (quasi 6-level VIP)";
        case 57: return "Regional NEXRAD, Type 2 - 8 level";
        case 58: return "Regional NEXRAD, Type 3 - 16 level";
        case 59: return "Individual NEXRAD, Type 0 - low dynamic range";
        case 60: return "Individual NEXRAD, Type 1 - 8 level (quasi 6-level VIP)";
        case 61: return "Individual NEXRAD, Type 2 - 8 level";
        case 62: return "Individual NEXRAD, Type 3 - 16 level";
        case 63: return "Global Block Representation - Regional NEXRAD, Type 4 – 8 level";
        case 64: return "Global Block Representation - CONUS NEXRAD, Type 4 - 8 level";
        case 81: return "Radar echo tops graphic, scheme 1: 16-level";
        case 82: return "Radar echo tops graphic, scheme 2: 8-level";
        case 83: return "Storm tops and velocity";
        case 101: return "Lightning strike type 1 (pixel level)";
        case 102: return "Lightning strike type 2 (grid element level)";
        case 151: return "Point phenomena, vector format";
        case 201: return "Surface conditions/winter precipitation graphic";
        case 202: return "Surface weather systems";
        case 254: return "AIRMET, SIGMET: Bitmap encoding";
        case 351: return "System Time";
        case 352: return "Operational Status";
        case 353: return "Ground Station Status";
        case 401: return "Generic Raster Scan Data Product APDU Payload Format Type 1";
        case 402:
        case 411: return "Generic Textual Data Product APDU Payload Format Type 1";
        case 403: return "Generic Vector Data Product APDU Payload Format Type 1";
        case 404:
        case 412: return "Generic Symbolic Product APDU Payload Format Type 1";
        case 405:
        case 413: return "Generic Textual Data Product APDU Payload Format Type 2";
        case 600: return "FISDL Products – Proprietary Encoding";
        case 2000: return "FAA/FIS-B Product 1 – Developmental";
        case 2001: return "FAA/FIS-B Product 2 – Developmental";
        case 2002: return "FAA/FIS-B Product 3 – Developmental";
        case 2003: return "FAA/FIS-B Product 4 – Developmental";
        case 2004: return "WSI Products - Proprietary Encoding";
        case 2005: return "WSI Developmental Products";
        default: return "unknown";
    }
}
var UatUplinkFrame = /** @class */ (function () {
    function UatUplinkFrame(reserved, frameType, frame) {
        // frame[4], frame[5], frame[6]=0x84/132, 0xA5/165, 0x70/112 and make the block reference indicator.
        // The element ID is SET which makes it Run Length Encoded.
        // The block reference number is 0x4A570 in the North hemisphere.
        // This block occupies a region from 123º 12' to 122º 24' West longitude, and from 45º 04' to 45º 08' North latitude.
        // Middle is -122.505005, 45.00275
        // GPS minutes to decimal degrees:
        // https://www.fcc.gov/media/radio/dms-decimal
        //
        // 0x4A570
        // 45° 4' 0"N, 123° 12' 18" W = 45.0666667, -123.205
        // 45° 8' 0"N, 122° 24' 0" W = 45.1333333, -122.4
        this.reserved = reserved;
        this.frameType = frameType;
        this.frame = frame;
        if (frame.length < 4) {
            console.error("Frame is too short to be valid!");
            return;
        }
        var isMonthDayValid = false;
        var isSecondsValid = false;
        var month = 0;
        var day = 0;
        var seconds = 0;
        var length = 0;
        var data = null;
        var aFlag = (frame[0] & 0x80) != 0;
        var gFlag = (frame[0] & 0x40) != 0;
        var pFlag = (frame[0] & 0x20) != 0;
        var productId = ((frame[0] & 0x1f) << 6) | (frame[1] >> 2);
        var isSouthernHemisphere = (frame[1] & 0x02) != 0;
        var opt = ((this.frame[1] & 0x01) << 1) | ((this.frame[2] >> 7));
        var hours = (frame[2] & 0x7c) >> 2;
        var minutes = ((frame[2] & 0x03) << 4) | (frame[3] >> 4);
        var padding = frame[3] & 15;
        console.log("    FRAME: product=" + productId + ", name=" + getFisbProductName(productId) + ", opt=" + opt + ", aFlag=" + aFlag + ", gFlag=" + gFlag + ", pFlag=" + pFlag + ", sFlag=" + isSouthernHemisphere + ", hours=" + hours + ", minutes=" + minutes + ", padding=" + padding);
        // NEXRAD
        if (productId == 63) {
            if (padding != 0) {
                console.error("Padding is not zero. Probable decoding error. padding=" + padding);
            }
            this.decodeNexradRegional(frame, isSouthernHemisphere);
        }
        // NOTAM is 8
        // AIRMET is 11
        // SIGMET is 12
        else if (productId == 8
            || productId == 11
            || productId == 12) {
            isMonthDayValid = true;
            isSecondsValid = false;
            month = (frame[2] & 0x78) >> 3;
            day = ((frame[2] & 0x07) << 2) | (frame[3] >> 6);
            hours = (frame[3] & 0x3e) >> 1;
            minutes = ((frame[3] & 0x01) << 5) | (frame[4] >> 3);
            length = frame.length - 5; // ???
            data = frame.subarray(5);
            var report = airmet_1.decodeAirmet(data);
            text_reports_1.TextReports.addReport(new text_report_1.TextReport(report));
        }
        else if (productId == 19) { // Very unknown. No guess
        }
        // Textual METAR or TAF is 413
        else if (productId == 405 || productId == 413) {
            var report = airmet_1.decodeGenericText(frame.subarray(4));
            text_reports_1.TextReports.addReport(new text_report_1.TextReport(report));
        }
        else if (productId == 84 || productId == 90 || productId == 1798) { // Probably some graphical product
        }
        else if (productId == 1037) { // some sort of mixed text and graphical product 
        }
        else {
            /*
            for (let offset = 0; ++offset; offset < length) {
                decodeGenericText(frame.subarray(offset));
            }
            */
            console.error("Unable to decode productId=" + productId);
        }
        switch (opt) {
            case 0: // Hours, Minutes
                isMonthDayValid = false;
                isSecondsValid = false;
                length = frame.length - 4;
                data = frame.subarray(4);
                break;
            case 1: // Hours, Minutes, Seconds
                if (frame.length < 5) {
                    break;
                }
                isMonthDayValid = false;
                isSecondsValid = true;
                seconds = ((frame[3] & 0x0f) << 2) | (frame[4] >> 6);
                length = frame.length - 5;
                data = frame.subarray(5);
                break;
            case 2: // Month, Day, Hours, Minutes
                if (frame.length < 5) {
                    break;
                }
                isMonthDayValid = true;
                isSecondsValid = false;
                month = (frame[2] & 0x78) >> 3;
                day = ((frame[2] & 0x07) << 2) | (frame[3] >> 6);
                hours = (frame[3] & 0x3e) >> 1;
                minutes = ((frame[3] & 0x01) << 5) | (frame[4] >> 3);
                length = frame.length - 5; // ???
                data = frame.subarray(5);
                break;
            case 3: // Month, Day, Hours, Minutes, Seconds
                if (frame.length < 6) {
                    break;
                }
                isMonthDayValid = true;
                isSecondsValid = true;
                month = (frame[2] & 0x78) >> 3;
                day = ((frame[2] & 0x07) << 2) | (frame[3] >> 6);
                hours = (frame[3] & 0x3e) >> 1;
                minutes = ((frame[3] & 0x01) << 5) | (frame[4] >> 3);
                seconds = ((frame[4] & 0x03) << 3) | (frame[5] >> 5);
                length = frame.length - 6;
                data = frame.subarray(6);
                break;
        }
    }
    UatUplinkFrame.prototype.decodeNexradRegional = function (frame, isSouthernHemisphere) {
        // NEXRAD description is on https://www.faa.gov/sites/faa.gov/files/air_traffic/technology/adsb/archival/GDL90_Public_ICD_RevA.PDF
        // pg36
        // FIS-B Spec: https://imlive.s3.amazonaws.com/Federal%20Government/ID133825730251125154988746465871038370/Attachment%205%20-%20SBS%20Essential%20Services%20System%20Specification_FAA-E-3006%20Rev.%20B%20dated%208-23-2019.pdf
        var scaleFactor = frame[4] & 0x30;
        var rleSet = (frame[4] & 128) != 0;
        var globalBlockReferenceIdentifier = ((frame[4] & 7) << 16) | (frame[5] << 8) | frame[6];
        var reflectivity = frame.subarray(7);
        // 0x4A570 = 123º 12' to 122º 24' West, 45º 04' to 45º 08' North
        //
        // 45.0666667, -123.205
        // 45.1333333, -122.4
        var boundaries = getCoordinateBoundariesFromBlockReferenceId(globalBlockReferenceIdentifier, isSouthernHemisphere, scaleFactor);
        /*
        Each of the remaining bytes of the APDU encode the value of each of the 128 bins that comprise
        this block (as 4 rows of 32 bins each). In each byte, the upper 5 bits represent the number of
        sequential bins (minus 1) that each have the intensity value given in the lower 3 bits. The next
        byte in the example data (0x30) indicates that the first 7 bins have Intensity value 0. The
        following byte (0x89) indicates that the next 18 bins have Intensity value 1. The following byte
        (0x50) indicates that the next 11 bins (the last 7 of the first row, plus the first 4 of the following
        row) have Intensity value 0.
        */
        var bins = [];
        for (var index in reflectivity) {
            var apduByte = reflectivity[index];
            var runCount = rleSet ? (apduByte >> 3) + 1 : 1;
            var intensity = apduByte & 7;
            bins.push(new nexrad_1.BinRun(runCount, intensity));
        }
        var newReflectivity = new nexrad_1.Reflectivity(globalBlockReferenceIdentifier, boundaries, bins);
        nexrad_1.ReflectivityRadar.addReport(newReflectivity);
    };
    return UatUplinkFrame;
}());
exports.UatUplinkFrame = UatUplinkFrame;
var Uplink = /** @class */ (function (_super) {
    __extends(Uplink, _super);
    function Uplink(message) {
        var _this = 
        // Application header and frame format
        // is from https://www.faa.gov/sites/faa.gov/files/air_traffic/technology/adsb/archival/GDL90_Public_ICD_RevA.PDF
        // page 31
        _super.call(this, logging_object_1.LogLevel.all) || this;
        _this.frames = [];
        console_1.assert(message.message[1] == 7);
        var timeOfReception = message.message.subarray(2, 5);
        _this.timeOfReception = (timeOfReception[0]) | (timeOfReception[1] << 8) | (timeOfReception[2] << 16);
        var payload = message.message.subarray(5).slice(0, 432);
        _this.applicationHeader = payload.slice(0, 8);
        _this.senderLocation = decodeHeader(_this.applicationHeader);
        _this.frames = getUplinkFrames(payload.slice(8));
        _this.LogSpew("UAT UPLINK: location=" + _this.senderLocation + ", frameCount=" + _this.frames.length);
        return _this;
    }
    return Uplink;
}(decoded_gdl90_message_1.DecodedGdl90Message));
exports.Uplink = Uplink;
function wrapCoordinates(lat, lon) {
    if (lat > 90) {
        lat -= 180;
    }
    if (lon > 180) {
        lon -= 360;
    }
    return [lat, lon];
}
function getReservedAndFrameType(payload) {
    var reserved = (payload[1] & 112) >> 4;
    // Per spec, frame type 0b1111 is reserved for future use
    // Per spec, frame type 0b0000 is is FIS-B APDU
    // Per spec, any value from 0b0001 to 0b1110 (inclusive) is reserved for future use
    var frameType = payload[1] & 15;
    if (reserved != 0) {
        console.error("Reserved field is not zero: " + reserved);
    }
    if (frameType != 0) {
        console.error("Frame type is not zero: " + frameType);
    }
    return [reserved, frameType];
}
function getUplinkFrames(payload) {
    var _a;
    var frames = [];
    while (payload.length > 0) {
        var frameLength = (payload[0] << 1) | (payload[1] >> 7);
        var remainingBytes = payload.length - 2;
        if (remainingBytes < 2 + frameLength) {
            if (frameLength > 0) {
                console.error("Hit an overrun of the UAT application data while decoding Uplink message!");
            }
            break;
        }
        if (frameLength > 0) {
            var reserved = void 0;
            var frameType = void 0;
            _a = getReservedAndFrameType(payload), reserved = _a[0], frameType = _a[1];
            var frameData = payload.subarray(2, frameLength + 2);
            var frame = new UatUplinkFrame(reserved, frameType, frameData);
            frames.push(frame);
            payload = payload.subarray(2 + frameLength);
        }
        else {
            // Obstensibly, we may just consider ending the decoding since it is improbable that we will have more frames
            payload = payload.subarray(2);
        }
    }
    return frames;
}
function decodeHeader(header) {
    var _a;
    var lat = (header[0] << 15) | (header[1] << 7) | (header[2] >> 1);
    var lon = ((header[2] & 0x01) << 23) | (header[3] << 15) | (header[4] << 7) | (header[5] >> 1);
    lat = lat * 360.0 / 16777216.0;
    lon = lon * 360.0 / 16777216.0;
    _a = wrapCoordinates(lat, lon), lat = _a[0], lon = _a[1];
    var appDataValid = (header[6] & 0x20) != 0;
    console_1.assert(appDataValid);
    return new coordinate_1.Coordinate(lon, lat);
}
function getPayloadFromSample(faaSample) {
    var payload = new Uint8Array(faaSample.length / 2);
    for (var i = 0; i < faaSample.length; i += 2) {
        payload[i / 2] = parseInt(faaSample.substr(i, 2), 16);
    }
    return payload;
}
var BlockWidth = (48.0 / 60.0);
var WideBlockWidth = (96.0 / 60.0);
var BlockHeight = (4.0 / 60.0);
var BlockThreshold = 405000;
var BlocksPerRing = 450;
/**
 * Calculates the boundaries of the UAT uplink radar
 * image based on the Block Reference Identifier.
 * This is the block reference identifier that is referred to
 * in the GDL90 spec, and is specified by RTCA DO-358A.
 * @param blockReferenceIdentifier - the FIS-B block reference identifier
 * @param isSouthernHemisphere - is the data from the Southern hemisphere?
 * @param scaleFactor - Any scale factor transmitted in the original data frame.
 * @returns - the corners of the radar image.
 */
function getCoordinateBoundariesFromBlockReferenceId(blockReferenceIdentifier, isSouthernHemisphere, scaleFactor) {
    // Code translated from Dump978/extract_nexrad.c
    // Full explanation is found there.
    //
    // Full spec is in §A.3.2 of the FIS-B MOPS, RTCA DO-358A.
    var scale = scaleFactor === 1
        ? 5.0
        : scaleFactor === 2
            ? 9.0
            : 1.0;
    blockReferenceIdentifier = (blockReferenceIdentifier >= BlockThreshold)
        ? blockReferenceIdentifier &= ~1
        : blockReferenceIdentifier;
    var rawLat = BlockHeight * Math.trunc(blockReferenceIdentifier / BlocksPerRing);
    var rawLon = (blockReferenceIdentifier % BlocksPerRing) * BlockWidth;
    var lonSize = (blockReferenceIdentifier >= BlockThreshold ? WideBlockWidth : BlockWidth) * scale;
    var latSize = BlockHeight * scale;
    // rawLat/rawLon points to the southwest corner in the northern hemisphere version
    var minLongitude = rawLon - 360.0;
    var minLatitude = isSouthernHemisphere
        ? 0 - rawLat // southern hemisphere, mirror along the equator
        : rawLat + BlockHeight; // adjust to the northwest corner
    var maxLatitude = minLatitude - latSize;
    var maxLongitude = minLongitude + lonSize;
    var westernLongitude = minLongitude < maxLatitude ? minLongitude : maxLongitude;
    var easternLongitude = minLongitude < maxLatitude ? maxLongitude : minLongitude;
    var northernLattitude = maxLatitude > minLatitude ? maxLatitude : minLatitude;
    var southernLattitude = maxLatitude > minLatitude ? minLatitude : maxLatitude;
    return new boundaries_1.CoordinateBoundaries(new coordinate_1.Coordinate(westernLongitude, northernLattitude), new coordinate_1.Coordinate(easternLongitude, southernLattitude));
}
function decodePayloadFromSample() {
    var payloads = [getPayloadFromSample(nexRadPlayloadSample1), getPayloadFromSample(nexRadPlayloadSample2)];
    for (var _i = 0, payloads_1 = payloads; _i < payloads_1.length; _i++) {
        var payload = payloads_1[_i];
        var frameLength = (payload[0] << 1) | (payload[1] >> 7);
        var frameType = payload[2] & 1;
        var graphic = payload.subarray(2, frameLength + 2);
        if (graphic.length != frameLength) {
            console.error("Frame length mismatch: " + graphic.length + " != " + frameLength);
        }
        var frameData = payload.subarray(2, frameLength + 2);
        var decodedFrame = new UatUplinkFrame(0, frameType, frameData);
    }
}
exports.decodePayloadFromSample = decodePayloadFromSample;
var nexRadPlayloadSample1 = "130000FC000084A570308950111A53120930110A23451B0A0918090A1B0C1D0607061D041B0A0108208000FC000084A3AE00090A1314150617061D04130A01080112131C0D06270615140B0A01000112131C0D06270615140B0A010000090A1314150617061D04130A0108148000FC000084A1EC00090A1B0C1D0607061D041B0A010808110A23451B0A091018111A53120920308930130000FC000084AAB7308950111A53120930110A23451B0A0918090A1B0C1D0607061D041B0A0108208000FC000084A8F500090A1314150617061D04130A01080112131C0D06270615140B0A01000112131C0D06270615140B0A010000090A1314150617061D04130A0108148000FC000084A73300090A1B0C1D0607061D041B0A010808110A23451B0A091018111A53120920308930130000FC000084AFFD308950111A53120930110A23451B0A0918090A1B0C1D0607061D041B0A0108000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
var nexRadPlayloadSample2 = "208000FC000084AE3B00090A1314150617061D04130A01080112131C0D06270615140B0A01000112131C0D06270615140B0A010000090A1314150617061D04130A0108148000FC000084AC7900090A1B0C1D0607061D041B0A010808110A23451B0A091018111A53120920308930040000FC000004B1BDF0040000FC000004AFFBD0040000FC000004AE39D0040000FC000004AC77D0040000FC000004AAB5D0040000FC000004A8F3D0040000FC000004A731D0040000FC000004A56FE0040000FC000004A3ADE0040000FC000004A1EBE000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
//# sourceMappingURL=uplink.js.map