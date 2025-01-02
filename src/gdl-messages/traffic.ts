import { assert } from "console";
import { LogLevel } from "../logging-object";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";


export class Traffic extends DecodedGdl90Message {
    constructor(
        message: Gdl90Message
    ) {
        super(LogLevel.error);

        assert(message.messageType == 20);
        // Uses 3.5.1
        // Pg 17 & 18
        // https://www.faa.gov/sites/faa.gov/files/air_traffic/technology/adsb/archival/GDL90_Public_ICD_RevA.PDF
        //if (deframedReport.length != 30) {
        //  this.LogError(`TRAFFIC: report.length=${report.length}`);
        //}
        this.LogSpew(`TRAFFIC:${message.message}`);
    }
}
