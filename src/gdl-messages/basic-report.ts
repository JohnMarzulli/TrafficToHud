import { assert } from "console";
import { LogLevel } from "../logging-object";
import { Coordinate } from "../types/coordinate";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";

/**
 * Store a "Basic Report" (Uplink nomeclature)
 */
export class BasicReport extends DecodedGdl90Message {
    public readonly location: Coordinate;
    public readonly altitude: number;
    public readonly speed: number;

    constructor(
        message: Gdl90Message
    ) {
        // EX:
        // "recievedAt": 1735669011827,
        // "report": "30,0,0,0,0,164,130,254,67,208,149,82,54,184,6,153,16,52,32,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,47,224"

        // Format defined on pg26, https://www.faa.gov/sites/faa.gov/files/air_traffic/technology/adsb/archival/GDL90_Public_ICD_RevA.PDF?form=MG0AV3

        super(LogLevel.all);

        assert(message.messageType == 30);

        // Basic report
        // Pg 26, FAA
        // UAT?
        const timeOfReception: Uint8Array = message.message.subarray(2, 5);
        const payload: Uint8Array = message.message.slice(5);

        // The payload is defined in RTCA/DO-282, Section 2.2
        const icaoAddress: Uint8Array = payload.slice(0, 3); // 3-byte ICAO address
        const flags: number = payload[3]; // Flags for type of data
        const latitude: number = (payload[4] << 16) | (payload[5] << 8) | payload[6]; // Latitude encoding
        const longitude: number = (payload[7] << 16) | (payload[8] << 8) | payload[9]; // Longitude encoding
        const additionalData: Uint8Array = payload.slice(14); // Any remaining data

        this.location = new Coordinate(longitude, latitude);
        this.altitude = (payload[10] << 8) | payload[11]; // Altitude
        this.speed = (payload[12] << 8) | payload[13]; // Velocity

        this.LogSpew(`UAT BASIC MSG: ${message.message.toString()}`);
        this.LogSpew(`UAT BASIC MSG: TimeReceived=${timeOfReception}, ICAO=${icaoAddress}, flags=${flags}, lat=${latitude}, long=${longitude}, alt=${this.altitude}, vel=${this.speed}, additional=${additionalData}, `);
    }
}
