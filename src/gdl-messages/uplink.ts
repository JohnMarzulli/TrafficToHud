import { assert } from "console";
import { LogLevel } from "../logging-object";
import { CoordinateBoundaries } from "../types/boundaries";
import { Coordinate } from "../types/coordinate";
import { BinRun, Reflectivity, ReflectivityRadar } from "../weather/nexrad";
import { TextReport } from '../weather/text-report';
import { TextReports } from "../weather/text-reports";
import { decodeAirmet, decodeGenericText } from "./airmet";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";

// References:
// https://www.faa.gov/sites/faa.gov/files/air_traffic/technology/adsb/archival/GDL90_Public_ICD_RevA.PDF
// https://phd-sid.ethz.ch/debian/stratux/stratux-1.5b2/notes/SBS-Description-Doc_SRT_47_rev01_20111024.pdf
// https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-149B.pdf
// https://www.faa.gov/documentlibrary/media/advisory_circular/ac_00-45h.pdf

function getFisbProductName(
    productId: number
) {
    switch (productId) {
        case 0: case 20: return "METAR and SPECI";
        case 1: case 21: return "TAF and Amended TAF";
        case 2: case 22: return "SIGMET";
        case 3: case 23: return "Convective SIGMET";
        case 4: case 24: return "AIRMET";
        case 5: case 25: return "PIREP";
        case 6: case 26: return "AWW";
        case 7: case 27: return "Winds and Temperatures Aloft";
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
        case 402: case 411: return "Generic Textual Data Product APDU Payload Format Type 1";
        case 403: return "Generic Vector Data Product APDU Payload Format Type 1";
        case 404: case 412: return "Generic Symbolic Product APDU Payload Format Type 1";
        case 405: case 413: return "Generic Textual Data Product APDU Payload Format Type 2";
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

export class UatUplinkFrame {
    public readonly reserved: number;
    public readonly frameType: number;
    public readonly frame: Uint8Array;

    constructor(
        reserved: number,
        frameType: number,
        frame: Uint8Array
    ) {
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

        let isMonthDayValid: boolean = false;
        let isSecondsValid: boolean = false;
        let month: number = 0;
        let day: number = 0;
        let seconds: number = 0;
        let length: number = 0;
        let data: Uint8Array = null;

        const aFlag: boolean = (frame[0] & 0x80) != 0;
        const gFlag: boolean = (frame[0] & 0x40) != 0;
        const pFlag: boolean = (frame[0] & 0x20) != 0;
        const productId: number = ((frame[0] & 0x1f) << 6) | (frame[1] >> 2);
        const isSouthernHemisphere: boolean = (frame[1] & 0x02) != 0;
        const opt: number = ((this.frame[1] & 0x01) << 1) | ((this.frame[2] >> 7));
        let hours: number = (frame[2] & 0x7c) >> 2;
        let minutes: number = ((frame[2] & 0x03) << 4) | (frame[3] >> 4);
        const padding = frame[3] & 0b00001111;

        console.log(`    FRAME: product=${productId}, name=${getFisbProductName(productId)}, opt=${opt}, aFlag=${aFlag}, gFlag=${gFlag}, pFlag=${pFlag}, sFlag=${isSouthernHemisphere}, hours=${hours}, minutes=${minutes}, padding=${padding}`);

        // NEXRAD
        if (productId == 63) {
            if (padding != 0) {
                console.error(`Padding is not zero. Probable decoding error. padding=${padding}`);
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

            const report: string = decodeAirmet(data);

            TextReports.addReport(new TextReport(report));
        }
        else if (productId == 19) {// Very unknown. No guess
        }
        // Textual METAR or TAF is 413
        else if (productId == 405 || productId == 413) {
            const report: string = decodeGenericText(frame.subarray(4));

            TextReports.addReport(new TextReport(report));
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
            console.error(`Unable to decode productId=${productId}`);
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

    private decodeNexradRegional(
        frame: Uint8Array,
        isSouthernHemisphere: boolean
    ) {
        // NEXRAD description is on https://www.faa.gov/sites/faa.gov/files/air_traffic/technology/adsb/archival/GDL90_Public_ICD_RevA.PDF
        // pg36
        // FIS-B Spec: https://imlive.s3.amazonaws.com/Federal%20Government/ID133825730251125154988746465871038370/Attachment%205%20-%20SBS%20Essential%20Services%20System%20Specification_FAA-E-3006%20Rev.%20B%20dated%208-23-2019.pdf

        const scaleFactor: number = frame[4] & 0x30;
        const rleSet: boolean = (frame[4] & 0b10000000) != 0;
        const globalBlockReferenceIdentifier = ((frame[4] & 0b00000111) << 16) | (frame[5] << 8) | frame[6];
        const reflectivity: Uint8Array = frame.subarray(7);

        // 0x4A570 = 123º 12' to 122º 24' West, 45º 04' to 45º 08' North
        //
        // 45.0666667, -123.205
        // 45.1333333, -122.4
        const boundaries: CoordinateBoundaries = getCoordinateBoundariesFromBlockReferenceId(globalBlockReferenceIdentifier, isSouthernHemisphere, scaleFactor);

        /*
        Each of the remaining bytes of the APDU encode the value of each of the 128 bins that comprise
        this block (as 4 rows of 32 bins each). In each byte, the upper 5 bits represent the number of
        sequential bins (minus 1) that each have the intensity value given in the lower 3 bits. The next
        byte in the example data (0x30) indicates that the first 7 bins have Intensity value 0. The
        following byte (0x89) indicates that the next 18 bins have Intensity value 1. The following byte
        (0x50) indicates that the next 11 bins (the last 7 of the first row, plus the first 4 of the following
        row) have Intensity value 0. 
        */

        let bins: BinRun[] = [];
        for (let index in reflectivity) {
            const apduByte = reflectivity[index];
            const runCount = rleSet ? (apduByte >> 3) + 1 : 1;
            const intensity = apduByte & 0b00000111;

            bins.push(new BinRun(runCount, intensity));
        }

        const newReflectivity: Reflectivity = new Reflectivity(globalBlockReferenceIdentifier, boundaries, bins);
        ReflectivityRadar.addReport(newReflectivity);
    }
}

export class Uplink extends DecodedGdl90Message {
    public readonly timeOfReception: number;
    public readonly applicationHeader: Uint8Array;
    public readonly frames: UatUplinkFrame[] = [];
    public readonly senderLocation: Coordinate;

    constructor(
        message: Gdl90Message
    ) {
        // Application header and frame format
        // is from https://www.faa.gov/sites/faa.gov/files/air_traffic/technology/adsb/archival/GDL90_Public_ICD_RevA.PDF
        // page 31
        super(LogLevel.all);

        assert(message.message[1] == 7);

        const timeOfReception: Uint8Array = message.message.subarray(2, 5);
        this.timeOfReception = (timeOfReception[0]) | (timeOfReception[1] << 8) | (timeOfReception[2] << 16);

        let payload: Uint8Array = message.message.subarray(5).slice(0, 432);

        this.applicationHeader = payload.slice(0, 8);
        this.senderLocation = decodeHeader(this.applicationHeader);
        this.frames = getUplinkFrames(payload.slice(8));

        this.LogSpew(`UAT UPLINK: location=${this.senderLocation}, frameCount=${this.frames.length}`);
    }
}

function wrapCoordinates(
    lat: number,
    lon: number
): [number, number] {
    if (lat > 90) {
        lat -= 180;
    }

    if (lon > 180) {
        lon -= 360;
    }

    return [lat, lon];
}

function getReservedAndFrameType(
    payload: Uint8Array
): [number, number] {
    const reserved = (payload[1] & 0b01110000) >> 4;
    // Per spec, frame type 0b1111 is reserved for future use
    // Per spec, frame type 0b0000 is is FIS-B APDU
    // Per spec, any value from 0b0001 to 0b1110 (inclusive) is reserved for future use
    const frameType = payload[1] & 0b00001111;

    if (reserved != 0) {
        console.error(`Reserved field is not zero: ${reserved}`);
    }

    if (frameType != 0) {
        console.error(`Frame type is not zero: ${frameType}`);
    }

    return [reserved, frameType];
}

function getUplinkFrames(
    payload: Uint8Array
): UatUplinkFrame[] {
    let frames: UatUplinkFrame[] = [];

    while (payload.length > 0) {
        const frameLength = (payload[0] << 1) | (payload[1] >> 7);
        const remainingBytes = payload.length - 2;

        if (remainingBytes < 2 + frameLength) {
            if (frameLength > 0) {
                console.error("Hit an overrun of the UAT application data while decoding Uplink message!");
            }

            break;
        }

        if (frameLength > 0) {
            let reserved: number;
            let frameType: number;
            [reserved, frameType] = getReservedAndFrameType(payload);

            const frameData: Uint8Array = payload.subarray(2, frameLength + 2);
            const frame: UatUplinkFrame = new UatUplinkFrame(reserved, frameType, frameData);

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

function decodeHeader(
    header: Uint8Array
): Coordinate {
    let lat: number = (header[0] << 15) | (header[1] << 7) | (header[2] >> 1);
    let lon: number = ((header[2] & 0x01) << 23) | (header[3] << 15) | (header[4] << 7) | (header[5] >> 1);
    lat = lat * 360.0 / 16777216.0;
    lon = lon * 360.0 / 16777216.0;

    [lat, lon] = wrapCoordinates(lat, lon);

    const appDataValid: boolean = (header[6] & 0x20) != 0;
    assert(appDataValid);

    return new Coordinate(lon, lat);
}

function getPayloadFromSample(
    faaSample: string
): Uint8Array {
    let payload: Uint8Array = new Uint8Array(faaSample.length / 2);
    for (let i = 0; i < faaSample.length; i += 2) {
        payload[i / 2] = parseInt(faaSample.substr(i, 2), 16);
    }

    return payload;
}


const BlockWidth: number = (48.0 / 60.0);
const WideBlockWidth: number = (96.0 / 60.0);
const BlockHeight: number = (4.0 / 60.0);
const BlockThreshold: number = 405000;
const BlocksPerRing: number = 450;

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
function getCoordinateBoundariesFromBlockReferenceId(
    blockReferenceIdentifier: number,
    isSouthernHemisphere: boolean,
    scaleFactor: number
): CoordinateBoundaries {
    // Code translated from Dump978/extract_nexrad.c
    // Full explanation is found there.
    //
    // Full spec is in §A.3.2 of the FIS-B MOPS, RTCA DO-358A.

    const scale = scaleFactor === 1
        ? 5.0
        : scaleFactor === 2
            ? 9.0
            : 1.0;

    blockReferenceIdentifier = (blockReferenceIdentifier >= BlockThreshold)
        ? blockReferenceIdentifier &= ~1
        : blockReferenceIdentifier;

    const rawLat: number = BlockHeight * Math.trunc(blockReferenceIdentifier / BlocksPerRing);
    const rawLon: number = (blockReferenceIdentifier % BlocksPerRing) * BlockWidth;
    const lonSize: number = (blockReferenceIdentifier >= BlockThreshold ? WideBlockWidth : BlockWidth) * scale;
    const latSize: number = BlockHeight * scale;

    // rawLat/rawLon points to the southwest corner in the northern hemisphere version
    const westLongitude: number = rawLon - 360.0;
    const northLatitude: number = isSouthernHemisphere
        ? 0 - rawLat // southern hemisphere, mirror along the equator
        : rawLat + BlockHeight; // adjust to the northwest corner

    const southLatitude: number = northLatitude - latSize;
    const eastLongitude: number = westLongitude + lonSize;

    return new CoordinateBoundaries(
        latSize / 4.0,
        BlockWidth / 32.0,
        new Coordinate(westLongitude, northLatitude),
        new Coordinate(eastLongitude, southLatitude));
}

export function decodePayloadFromSample() {
    const payloads: Uint8Array[] = [getPayloadFromSample(faaExampleNexradOregonFirstHalf), getPayloadFromSample(faaExampleNexradOregonSecondHalf)];

    for (const payload of payloads) {
        const frameLength = (payload[0] << 1) | (payload[1] >> 7);
        const frameType = payload[2] & 0b00000001;
        const graphic = payload.subarray(2, frameLength + 2);

        if (graphic.length != frameLength) {
            console.error(`Frame length mismatch: ${graphic.length} != ${frameLength}`);
        }

        const frameData: Uint8Array = payload.subarray(2, frameLength + 2);
        const decodedFrame = new UatUplinkFrame(0, frameType, frameData);
    }
}

// Corner: 45'8", 123'12" => 45.1333, -123.2
// Corner: 45'4", 122'24" => 45.0667, -122.4
const faaExampleNexradOregonFirstHalf: string = "130000FC000084A570308950111A53120930110A23451B0A0918090A1B0C1D0607061D041B0A0108208000FC000084A3AE00090A1314150617061D04130A01080112131C0D06270615140B0A01000112131C0D06270615140B0A010000090A1314150617061D04130A0108148000FC000084A1EC00090A1B0C1D0607061D041B0A010808110A23451B0A091018111A53120920308930130000FC000084AAB7308950111A53120930110A23451B0A0918090A1B0C1D0607061D041B0A0108208000FC000084A8F500090A1314150617061D04130A01080112131C0D06270615140B0A01000112131C0D06270615140B0A010000090A1314150617061D04130A0108148000FC000084A73300090A1B0C1D0607061D041B0A010808110A23451B0A091018111A53120920308930130000FC000084AFFD308950111A53120930110A23451B0A0918090A1B0C1D0607061D041B0A0108000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
const faaExampleNexradOregonSecondHalf: string = "208000FC000084AE3B00090A1314150617061D04130A01080112131C0D06270615140B0A01000112131C0D06270615140B0A010000090A1314150617061D04130A0108148000FC000084AC7900090A1B0C1D0607061D041B0A010808110A23451B0A091018111A53120920308930040000FC000004B1BDF0040000FC000004AFFBD0040000FC000004AE39D0040000FC000004AC77D0040000FC000004AAB5D0040000FC000004A8F3D0040000FC000004A731D0040000FC000004A56FE0040000FC000004A3ADE0040000FC000004A1EBE000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";