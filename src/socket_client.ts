import * as WebSocket from "ws";
import { LoggingObject, LogLevel } from "./logging_object";

export abstract class SocketClient extends LoggingObject {
    private readonly StratuxAddress: string = "192.168.10.1";

    private readonly url: string;
    private readonly route: string;
    private readonly checkInterval: number = 10000; // 10 seconds

    protected readonly socket_name: string;
    protected response_package: any = {};

    private webSocketClient: WebSocket | null = null;
    private lastMessageTime: number = 0;
    private intervalId: NodeJS.Timeout | null = null;

    constructor(
        socket_name: string,
        route: string,
        log_level: LogLevel = LogLevel.error
    ) {
        super(log_level);

        this.socket_name = socket_name;
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
        this.webSocketClient.onclose = () => this.LogInfo(`${this.socket_name}: closed`);
        this.webSocketClient.onerror = (error) => this.LogErrorDetails(`${this.socket_name}: error`, error);
    }

    private handleOpen(): void {
        this.LogInfo(`${this.socket_name}: connected`);
        this.lastMessageTime = Date.now();
    }

    protected handleMessage(data: WebSocket.Data): void {
        this.lastMessageTime = Date.now();
        const decoded: string = this.decode(data);

        this.LogSpew(`${this.socket_name} RAW: ${data.toString()}`);
        this.LogInfo(`${this.socket_name} decoded: ${decoded}`);

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
        this.LogInfo(`${this.socket_name}: Reconnecting...`);
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

        if (this.response_package == null || this.response_package == undefined) {
            this.response_package = json;
        }
        else {
            const merged = { ...this.response_package, ...json };
            this.response_package = merged;
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
            "service_name": this.socket_name,
            socketStatus: this.webSocketClient != null ? this.webSocketClient.readyState : 0,
            socketTimeSinceLastTraffic: this.getSecondsSince()
        };
    }

    public getServiceResponse(req: Request): any {
        if (req == null || this.response_package == null) {
            return {};
        }

        return this.response_package;
    }
}
