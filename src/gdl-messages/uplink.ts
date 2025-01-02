import { assert, log } from "console";
import { LogLevel } from "../logging-object";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";

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