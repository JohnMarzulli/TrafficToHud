import { Coordinate } from "../types/coordinate";
import { DecodedGdl90Message } from "./decoded-gdl90-message";
import { Gdl90Message } from "./gdl90-message";
/**
 * Store a "Basic Report" (Uplink nomeclature)
 */
export declare class BasicReport extends DecodedGdl90Message {
    readonly location: Coordinate;
    readonly altitude: number;
    readonly speed: number;
    constructor(message: Gdl90Message);
}
