import { DecodedGdl90Message } from "./decoded-gdl90-message";
/**
 * A GDL90 message that has been received and decoded.
 * Stores the raw message, details, and the decoded message.
 */
export declare class Gdl90Message {
    /**
     * The time the message was received and decoded.
     */
    readonly receivedAt: number;
    /**
     * The UAT UPLINK message type.
     */
    readonly messageType: number;
    /**
     * The undecoded message string.
     */
    readonly rawMessage: string;
    /**
     * The undecoded message bytes. Same as the string, but in a byte array.
     */
    readonly message: Uint8Array;
    /**
     * The decoded message object. Could be any type of message.
     */
    readonly decodedMessage: DecodedGdl90Message;
    constructor(rawMessage: string);
}
