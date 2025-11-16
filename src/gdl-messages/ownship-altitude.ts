import { assert } from "console";
import { LogLevel } from "../logging-object";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";


export class OwnshipAltitude extends DecodedGdl90Message {
    constructor(
        message: Gdl90Message
    ) {
        super(LogLevel.error);

        assert(message.messageType == 11);
        this.LogSpew(`OWNSHIP:${message.message}`);
    }
}
