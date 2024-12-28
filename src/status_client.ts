import * as WebSocket from "ws";

const StratuxAddress: string = "192.168.10.1";
const SecondsToCheckSocketClient: number = 1;
const WebSocketTimeoutSeconds: number = 60;


class JsonPackage extends Map<string, any> { }
class StatusResponsePackage extends Map<string, JsonPackage> { }

var lastWebsocketReportTime: number = 0;

var radarWebSocketClient: WebSocket;

/**
 * Get the number of seconds since the given time.
 *
 * @param {number} lastTime The time we want to get the time since.
 * @returns {number} The number of seconds between NOW and the given time.
 */
function getSecondsSince(
  lastTime: number
): number {
  if (lastTime == null) {
    return 0.0;
  }

  return (Date.now() - lastTime) / 1000;
}

function reportStatus(
  report: JsonPackage
): void {
  try {
    if (report == null) {
      return;
    }

    lastWebsocketReportTime = Date.now();
  } catch (e) {
    console.error(`Issue merging report into cache:${e}`);
  }
}


export class StatusClient {
  public static resetWebSocketClient(): void {
    this.createWebSocketClient();
  }

  public static createWebSocketClient(): void {
    if (radarWebSocketClient != null) {
      console.log("Status Socket closed by createWebSocket");
      radarWebSocketClient.close();
    }

    radarWebSocketClient = new WebSocket(`ws://${StratuxAddress}/status`);

    radarWebSocketClient.onopen = function () {
      console.log("Status Socket open");
      lastWebsocketReportTime = Date.now();
    };

    radarWebSocketClient.onerror = function (error) {
      console.error(`Status ERROR:${error.message}`);
    };

    radarWebSocketClient.onmessage = function (message) {
      //console.debug(`Status: ${message.data.toString()}`);
      lastWebsocketReportTime = Date.now();

      try {
        var json = JSON.parse(message.data.toString());
        reportStatus(json);
      } catch (e) {
        console.log(`${e}: Error handling Status report:`, message.data);
      }
    };
  }
  public static checkWebSocket(): void {
    if (radarWebSocketClient == null
      || getSecondsSince(lastWebsocketReportTime) > WebSocketTimeoutSeconds) {
      console.log(`Status Socket not heard from in ${WebSocketTimeoutSeconds} seconds`);
      StatusClient.createWebSocketClient();
    }
  }

  public static getServiceStatusResponseBody(
    req: Request
  ): any {
    return {
      socketStatus: radarWebSocketClient != null ? radarWebSocketClient.readyState : 0,
      socketTimeSinceLastTraffic: getSecondsSince(lastWebsocketReportTime)
    };
  }

  public static getStatusFullResponseBody(
    req: Request
  ): string {
    return '';
  }
}

setInterval(StatusClient.checkWebSocket, SecondsToCheckSocketClient * 1000);
