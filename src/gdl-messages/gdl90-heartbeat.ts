import { assert } from "console";
import { LogLevel } from "../logging-object";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";


export class Gdl90Heartbeat extends DecodedGdl90Message {
    constructor(
        message: Gdl90Message
    ) {
        super(LogLevel.error);

        assert(message.messageType == 0);

        this.LogSpew(`HEARTBEAT: Status=${message.message[2]}/${message.message[3]}, TimeStamp=${message.message[4]}${message.message[5]}, MsgCounts=${message.message[6]}${message.message[7]}`);
    }
}
