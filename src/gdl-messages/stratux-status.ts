import { assert } from "console";
import { LogLevel } from "../logging-object";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";


export class StratuxStatus extends DecodedGdl90Message {
    constructor(
        message: Gdl90Message
    ) {
        super(LogLevel.error);

        assert(message.messageType == 83);

        // Stratux Status
        // from gen_gdl90.go:495
        this.LogSpew(`STRATUX: SoftVer=${message.rawMessage.substring(5, 8)}, HardVer=${message.rawMessage.substring(9, 12)}, DataValid=${message.message[14]}, Unk=${message.message[15]}, HardStatus=${message.message[16]}, GpsLock=${message.message[17]}, Towers=${message.message.subarray(29)}`);
    }
}
