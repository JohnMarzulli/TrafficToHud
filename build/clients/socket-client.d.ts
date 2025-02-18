import * as WebSocket from "ws";
import { LoggingObject, LogLevel } from "../logging-object";
export declare abstract class SocketClient extends LoggingObject {
    private readonly StratuxAddress;
    private readonly url;
    private readonly route;
    private readonly checkInterval;
    protected readonly socketName: string;
    protected responsePackage: any;
    private webSocketClient;
    private lastMessageTime;
    private intervalId;
    constructor(socketName: string, route: string, logLevel?: LogLevel);
    start(): void;
    reset(): void;
    private connect;
    private handleOpen;
    protected handleMessage(data: WebSocket.Data): void;
    private reconnectOnTimeout;
    private reconnect;
    getSecondsSince(): number;
    protected decode(data: WebSocket.Data): string;
    protected report(report: string): void;
    protected keyInPackage(dataPackage: any, key: string): boolean;
    getServiceStatus(req: Request): any;
    getServiceResponse(req: Request): any;
}
