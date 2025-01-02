import { assert } from "console";
import { LogLevel } from "../logging-object";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";


export class OwnshipDetails extends DecodedGdl90Message {
    constructor(
        message: Gdl90Message
    ) {
        super(LogLevel.error);

        const subType = message.message[2];

        assert(message.messageType == 101);
        assert(subType == 0);

        // Uses 3.5.1
        this.LogSpew(`OWNSHIP DETAILS: Sub=${subType}, DevName=${message.message.subarray(12, 20)}, DevLongName=${message.message.subarray(20, 36)}`);
    }
}
