import { assert, log } from "console";
import { LogLevel } from "../logging-object";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";

export class Frame {
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
    public readonly frames: Frame[] = [];
    public readonly senderLat: number;
    public readonly senderLon: number;

    private decodeHeader(): [number, number] {
        let rawLat: number = (this.applicationHeader[0] << 15) | (this.applicationHeader[1] << 7) | (this.applicationHeader[2] >> 1);
        let rawLon: number = ((this.applicationHeader[2] & 0x01) << 23) | (this.applicationHeader[3] << 15) | (this.applicationHeader[4] << 7) | (this.applicationHeader[5] >> 1);
        let lat: number = rawLat * 360.0 / 16777216.0;
        let lon: number = rawLon * 360.0 / 16777216.0;

        if (lat > 90) {
            lat -= 180;
        }
        if (lon > 180) {
            lon -= 360;
        }

        const appDataValid: boolean = (this.applicationHeader[6] & 0x20) != 0;

        if (!appDataValid) {
            this.LogError(`valid=${appDataValid}, lat=${lat}, lon=${lon}`);
        }

        return [lat, lon];
    }

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

        [this.senderLat, this.senderLon] = this.decodeHeader();

        let remainingPayload = payload.subarray(8);

        while (remainingPayload.length > 0) {
            const frameLength = (remainingPayload[0] << 1) | (remainingPayload[1] >> 7);

            const remainingBytes = remainingPayload.length - 2;

            if (remainingBytes < 2 + frameLength) {
                if (frameLength > 0) {
                    this.LogError("Hit an overrun of the UAT application data while decoding Uplink message!");
                }

                break;
            }

            if (frameLength > 0) {
                const reserved = (remainingPayload[1] & 0b01110000) >> 4;
                // Per spec, frame type 0b1111 is reserved for future use
                // Per spec, frame type 0b0000 is is FIS-B APDU
                // Per spec, any value from 0b0001 to 0b1110 (inclusive) is reserved for future use
                const frameType = remainingPayload[1] & 0b00001111;

                if (reserved != 0) {
                    this.LogError(`Reserved field is not zero: ${reserved}`);
                }

                if (frameType != 0) {
                    this.LogError(`Frame type is not zero: ${frameType}`);
                }

                const frameData: Uint8Array = remainingPayload.subarray(2, frameLength + 2);

                const frame: Frame = new Frame(reserved, frameType, frameData);
                this.frames.push(frame);

                remainingPayload = remainingPayload.subarray(2 + frameLength);
            }
            else {
                // Obstensibly, we may just consider ending the decoding since it is improbable that we will have more frames
                remainingPayload = remainingPayload.subarray(2);
            }
        }

        this.LogSpew(`UAT UPLINK: lat=${this.senderLat}, long=${this.senderLon}, frameCount=${this.frames.length}`);
    }
}
