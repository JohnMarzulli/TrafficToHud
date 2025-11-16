import { Coordinate } from "../types/coordinate";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";
export declare class UatUplinkFrame {
    readonly reserved: number;
    readonly frameType: number;
    readonly frame: Uint8Array;
    constructor(reserved: number, frameType: number, frame: Uint8Array);
    private decodeNexradRegional;
}
export declare class Uplink extends DecodedGdl90Message {
    readonly timeOfReception: number;
    readonly applicationHeader: Uint8Array;
    readonly frames: UatUplinkFrame[];
    readonly senderLocation: Coordinate;
    constructor(message: Gdl90Message);
}
export declare function decodePayloadFromSample(): void;
