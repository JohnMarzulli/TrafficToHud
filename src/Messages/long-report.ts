import { assert } from "console";
import { LogLevel } from "../logging-object";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";


export class LongReport extends DecodedGdl90Message {
    constructor(
        message: Gdl90Message
    ) {
        super(LogLevel.all);

        assert(message.messageType == 31);

        // Basic report
        // Pg 26, FAA
        // UAT?
        this.LogSpew(`UAT LONG MSG: TimeReceived=${message.message.subarray(2, 4)}, Payload=${message.rawMessage.substring(5, 38)}`);
    }
}
