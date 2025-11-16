import * as WebSocket from "ws";
import { SocketClient } from "./socket-client";
export declare class RadarClient extends SocketClient {
    private readonly TrafficRemovalPeriodSeconds;
    constructor();
    protected report(report: string): void;
    protected handleMessage(data: WebSocket.Data): void;
}
