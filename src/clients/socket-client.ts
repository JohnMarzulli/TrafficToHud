import * as WebSocket from "ws";
import { LoggingObject, LogLevel } from "../logging-object";

export abstract class SocketClient extends LoggingObject {
    private readonly StratuxAddress: string = "192.168.10.1";

    private readonly url: string;
    private readonly route: string;
    private readonly checkInterval: number = 10000; // 10 seconds

    protected readonly socketName: string;
    protected responsePackage: any = {};

    private webSocketClient: WebSocket | null = null;
    private lastMessageTime: number = 0;
    private intervalId: NodeJS.Timeout | null = null;

    constructor(
        socketName: string,
        route: string,
        logLevel: LogLevel = LogLevel.error
    ) {
        super(logLevel);

        this.socketName = socketName;
        this.route = route;
        this.url = `ws://${this.StratuxAddress}/${this.route}`;

        this.start();
    }

    public start(): void {
        this.connect();
        this.reconnectOnTimeout();
    }

    public reset(): void {
        if (this.webSocketClient != null) {
            this.webSocketClient.close();
            this.webSocketClient = null;
        }

        this.connect();
    }

    private connect(): void {
        this.webSocketClient = new WebSocket(this.url);
        this.webSocketClient.onopen = () => this.handleOpen();
        this.webSocketClient.onmessage = (event) => this.handleMessage(event.data);
        this.webSocketClient.onclose = () => this.LogInfo(`${this.socketName}: closed`);
        this.webSocketClient.onerror = (error) => this.LogErrorDetails(`${this.socketName}: error`, error);
    }

    private handleOpen(): void {
        this.LogInfo(`${this.socketName}: connected`);
        this.lastMessageTime = Date.now();
    }

    protected handleMessage(data: WebSocket.Data): void {
        this.lastMessageTime = Date.now();
        const decoded: string = this.decode(data);

        this.LogSpew(`${this.socketName} RAW: ${data.toString()}`);
        this.LogInfo(`${this.socketName} decoded: ${decoded}`);

        this.report(decoded);
    }

    private reconnectOnTimeout(): void {
        this.intervalId = setInterval(() => {
            if (Date.now() - this.lastMessageTime > this.checkInterval) {
                this.reconnect();
            }
        }, this.checkInterval);
    }

    private reconnect(): void {
        this.LogInfo(`${this.socketName}: Reconnecting...`);
        if (this.webSocketClient) {
            this.webSocketClient.close();
        }
        this.connect();
    }

    public getSecondsSince(): number {
        if (this.lastMessageTime == null) {
            return 0.0;
        }

        return (Date.now() - this.lastMessageTime) / 1000;
    }

    protected decode(data: WebSocket.Data): string { return data.toString(); }

    protected report(report: string) {
        let json = JSON.parse(report);

        if (json == null || json == undefined) {
            json = {};
        }

        if (this.responsePackage == null || this.responsePackage == undefined) {
            this.responsePackage = json;
        }
        else {
            const merged = { ...this.responsePackage, ...json };
            this.responsePackage = merged;
        }
    }

    protected keyInPackage(dataPackage: any, key: string) {
        if (dataPackage == null || dataPackage == undefined) {
            return false;
        }

        if (key == null || key == undefined) {
            return false;
        }

        if (dataPackage[key] == undefined || !(key in dataPackage)) {
            return false;
        }

        return true;
    }

    public getServiceStatus(
        req: Request
    ): any {
        return {
            "service_name": this.socketName,
            socketStatus: this.webSocketClient != null ? this.webSocketClient.readyState : 0,
            socketTimeSinceLastTraffic: this.getSecondsSince()
        };
    }

    public getServiceResponse(req: Request): any {
        if (req == null || this.responsePackage == null) {
            return {};
        }

        return this.responsePackage;
    }
}
