import { DecodedGdl90Message } from "./decoded-gdl90-message";
export declare class Gdl90Message {
    readonly receivedAt: number;
    readonly messageType: number;
    readonly rawMessage: string;
    readonly message: Uint8Array;
    readonly decodedMessage: DecodedGdl90Message;
    constructor(raw_message: string);
    private getChecksumAndExpected;
    private compareBytes;
}
export declare function getDecodedMessage(message: Gdl90Message): DecodedGdl90Message;
