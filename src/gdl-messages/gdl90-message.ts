import * as DataHandling from "../data_handling";
import { BasicReport } from "./basic-report";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Heartbeat } from "./gdl90-heartbeat";
import { LongReport } from "./long-report";
import { Ownship } from "./ownship";
import { OwnshipAhrs } from "./ownship-ahrs";
import { OwnshipAltitude } from "./ownship-altitude";
import { OwnshipDetails } from "./ownship-details";
import { StratuxHeartbeat } from "./stratux-heartbeat";
import { StratuxStatus } from "./stratux-status";
import { Traffic } from "./traffic";
import { Uplink } from "./uplink";

export class Gdl90Message {
    public readonly receivedAt: number;
    public readonly messageType: number;
    public readonly rawMessage: string;
    public readonly message: Uint8Array;

    public readonly decodedMessage: DecodedGdl90Message;

    constructor(
        raw_message: string
    ) {
        this.receivedAt = Date.now();
        this.rawMessage = raw_message.trim();
        this.message = DataHandling.unescapeData(DataHandling.getBytes(this.rawMessage));
        this.messageType = Number(this.message[1].toString());
        this.decodedMessage = getDecodedMessage(this);
    }
}

export function getDecodedMessage(
    message: Gdl90Message,
): DecodedGdl90Message {
    const constructorMap: { [key: number]: new (message: Gdl90Message) => DecodedGdl90Message; } = {
        0: Gdl90Heartbeat,
        10: Ownship,
        11: OwnshipAltitude,
        20: Traffic,
        204: StratuxHeartbeat,
        30: BasicReport,
        31: LongReport,
        7: Uplink,
        83: StratuxStatus
    };

    if (message.messageType == 101) {
        const subType: number = message.message[2];

        return subType == 0
            ? new OwnshipDetails(message)
            : new OwnshipAhrs(message);
    }

    if (message.messageType in constructorMap) {
        return new constructorMap[message.messageType](message);
    }

    console.error(`UNKNOWN MSG:${message.messageType} - ${message.message}`);

    return null;
}