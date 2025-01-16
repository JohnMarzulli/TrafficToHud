import * as WebSocket from "ws";
import { LoggingObject, LogLevel } from "./logging-object";
export declare abstract class SocketClient extends LoggingObject {
    private readonly StratuxAddress;
    private readonly url;
    private readonly route;
    private readonly checkInterval;
    protected readonly socket_name: string;
    protected response_package: any;
    private webSocketClient;
    private lastMessageTime;
    private intervalId;
    constructor(socket_name: string, route: string, log_level?: LogLevel);
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
