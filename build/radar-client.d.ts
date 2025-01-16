import { SocketClient } from "./socket-client";
import * as WebSocket from "ws";
export declare class RadarClient extends SocketClient {
    private readonly TrafficRemovalPeriodSeconds;
    constructor();
    protected report(report: string): void;
    protected handleMessage(data: WebSocket.Data): void;
}
