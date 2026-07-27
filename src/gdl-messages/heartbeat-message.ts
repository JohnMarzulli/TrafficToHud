import { assert } from "console";
import { LogLevel } from "../logging-object";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";


export class HeartbeatMessage extends DecodedGdl90Message {
    // It is ALWAYS
    // ID: 253
    // 126,253,4,4,253,126
    constructor(
        message: Gdl90Message
    ) {
        super(LogLevel.error);

        assert(message.messageType == 253);

        // Stratux Status
        // from gen_gdl90.go:495
        this.LogSpew(`Unknown Heartbeat Message: ${message.message}`);
    }
}
