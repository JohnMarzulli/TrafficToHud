import * as WebSocket from "ws";
import { SocketClient } from "./socket-client";
export declare class Gdl90Client extends SocketClient {
    constructor();
    protected decode(data: WebSocket.Data): string;
    protected report(report: string): void;
    protected decodeReport(report: string): void;
    private addToMessageHistory;
    private decodeBase64;
}
