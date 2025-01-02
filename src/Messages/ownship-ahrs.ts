import { assert } from "console";
import { LogLevel } from "../logging-object";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";


export class OwnshipAhrs extends DecodedGdl90Message {
    constructor(
        message: Gdl90Message
    ) {
        super(LogLevel.error);

        const subType = message.message[2];

        assert(message.messageType == 101);
        assert(subType == 1);

        // Uses 3.5.1
        this.LogSpew(`OWNSHIP AHRS: Data=${message.message}`);
    }
}
