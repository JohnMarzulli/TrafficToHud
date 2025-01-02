import { assert, log } from "console";
import { LogLevel } from "../logging-object";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";

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
        this.reserved = reserved;
        this.frameType = frameType;
        this.frame = frame;

        if (frame.length < 4) {
            console.error("Frame is too short to be valid!");

            return;
        }

        let monthday_valid: boolean = false;
        let seconds_valid: boolean = false;
        let month: number = 0;
        let day: number = 0;
        let seconds: number = 0;
        let length: number = 0;
        let data: Uint8Array = null;

        const aFlag: number = (frame[0] & 0x80) ? 1 : 0;
        const gFlag: number = (frame[0] & 0x40) ? 1 : 0;
        const pFlag: number = (frame[0] & 0x20) ? 1 : 0;
        const productId: number = ((frame[0] & 0x1f) << 6) | (frame[1] >> 2);
        const sFlag: number = (frame[1] & 0x02) ? 1 : 0;
        const opt: number = ((this.frame[1] & 0x01) << 1) | ((this.frame[2] >> 7));
        let hours: number = (frame[2] & 0x7c) >> 2;
        let minutes: number = ((frame[2] & 0x03) << 4) | (frame[3] >> 4);
        const padding = frame[3] & 0b00001111;

        /*
        // AIRMET may not have padding=0
        if (padding != 0) {
            console.error(`Padding is not zero. Probable decoding error. padding=${padding}`);
        }
        */

        console.log(`    FRAME: name=${getFisbProductName(productId)}, opt=${opt}, aFlag=${aFlag}, gFlag=${gFlag}, pFlag=${pFlag}, sFlag=${sFlag}, hours=${hours}, minutes=${minutes}, padding=${padding}`);

        // NEXRAD description is on https://www.faa.gov/sites/faa.gov/files/air_traffic/technology/adsb/archival/GDL90_Public_ICD_RevA.PDF
        // pg36
        // FIS-B Spec: https://imlive.s3.amazonaws.com/Federal%20Government/ID133825730251125154988746465871038370/Attachment%205%20-%20SBS%20Essential%20Services%20System%20Specification_FAA-E-3006%20Rev.%20B%20dated%208-23-2019.pdf

        switch (opt) {
            case 0: // Hours, Minutes
                monthday_valid = false;
                seconds_valid = false;
                length = frame.length - 4;
                data = frame.subarray(4);
                break;
            case 1: // Hours, Minutes, Seconds
                if (frame.length < 5) {
                    break;
                }
                monthday_valid = false;
                seconds_valid = true;
                seconds = ((frame[3] & 0x0f) << 2) | (frame[4] >> 6);
                length = frame.length - 5;
                data = frame.subarray(5);
                break;
            case 2: // Month, Day, Hours, Minutes
                if (frame.length < 5) {
                    break;
                }
                monthday_valid = true;
                seconds_valid = false;
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
                monthday_valid = true;
                seconds_valid = true;
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
}

export class Uplink extends DecodedGdl90Message {
    public readonly timeOfReception: number;
    public readonly applicationHeader: Uint8Array;
    public readonly frames: UatUplinkFrame[] = [];
    public readonly senderLat: number;
    public readonly senderLon: number;

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

        [this.senderLat, this.senderLon] = decodeHeader(this.applicationHeader);

        this.frames = getUplinkFrames(payload.slice(8));

        this.LogSpew(`UAT UPLINK: lat=${this.senderLat}, long=${this.senderLon}, frameCount=${this.frames.length}`);
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
        this.LogError(`Reserved field is not zero: ${reserved}`);
    }

    if (frameType != 0) {
        this.LogError(`Frame type is not zero: ${frameType}`);
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
                this.LogError("Hit an overrun of the UAT application data while decoding Uplink message!");
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
): [number, number] {
    let lat: number = (header[0] << 15) | (header[1] << 7) | (header[2] >> 1);
    let lon: number = ((header[2] & 0x01) << 23) | (header[3] << 15) | (header[4] << 7) | (header[5] >> 1);
    lat = lat * 360.0 / 16777216.0;
    lon = lon * 360.0 / 16777216.0;

    [lat, lon] = wrapCoordinates(lat, lon);

    const appDataValid: boolean = (header[6] & 0x20) != 0;
    assert(appDataValid);

    return [lat, lon];
}