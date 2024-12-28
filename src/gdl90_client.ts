import * as WebSocket from "ws";
import * as WeatherReport from "./weather_report";

const StratuxAddress: string = "192.168.10.1";
const SecondsToCheckSocketClient: number = 1;
const WebSocketTimeoutSeconds: number = 10;


class JsonPackage extends Map<string, any> { }
class Gdl90ResponsePackage extends Map<string, JsonPackage> { }

var gdl90Cache: Gdl90ResponsePackage = new Map<string, JsonPackage>();
var lastWebsocketReportTime: number = 0;

var gdl90WebSocketClient: WebSocket;

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

function reportGdl90(
  report: string
): void {
  try {
    if (report == null) {
      return;
    }

    const decodedBytes = new Uint8Array(report.length);

    for (let i = 0; i < report.length; i++) {
      decodedBytes[i] = report.charCodeAt(i);
    }

    lastWebsocketReportTime = Date.now();

    WeatherReport.parseGdl90Weather(decodedBytes);
  } catch (e) {
    console.error(`Issue merging report into cache:${e}`);
  }
}


export class Gdl90Client {
  public static resetWebSocketClient(): void {
    this.createWebSocketClient();
  }

  public static createWebSocketClient(): void {
    if (gdl90WebSocketClient != null) {
      //console.log("GDL90 Socket closed by createWebSocket");
      gdl90WebSocketClient.close();
    }

    gdl90WebSocketClient = new WebSocket(`ws://${StratuxAddress}/gdl90`);

    gdl90WebSocketClient.onopen = function () {
      console.log("GDL90 Socket open");
      lastWebsocketReportTime = Date.now();
    };

    gdl90WebSocketClient.onerror = function (error) {
      //console.error(`GDL90 ERROR:${error.message}`);
    };

    gdl90WebSocketClient.onmessage = function (message) {
      const rawMessage: string = message.data.toString();
      const decodedGdl90: string = Gdl90Client.decodeBase64(rawMessage);

      //console.log(`GDL90 RAW: ${rawMessage}`);
      //console.log(`GDL90 decoded: ${decodedGdl90}`);

      try {
        lastWebsocketReportTime = Date.now();

        reportGdl90(decodedGdl90);
      } catch (e) {
        console.log(`${e}: Error handling GDL90 report:`, message.data);
      }
    };
  }

  private static decodeBase64(base64: string): string {
    // Decode the Base64 string
    let preparedString: string = base64.replace('"', '');
    preparedString = preparedString.replace('"', '');
    const decodedString = atob(preparedString);

    return decodedString;
  }

  public static checkWebSocket(): void {
    if (gdl90WebSocketClient == null
      || getSecondsSince(lastWebsocketReportTime) > WebSocketTimeoutSeconds) {
      //console.log(`GDL90 Socket not heard from in ${WebSocketTimeoutSeconds} seconds`);
      Gdl90Client.createWebSocketClient();
    }
  }

  public static getServiceStatusResponseBody(
    req: Request
  ): any {
    return {
      socketStatus: gdl90WebSocketClient != null ? gdl90WebSocketClient.readyState : 0,
      socketTimeSinceLastTraffic: getSecondsSince(lastWebsocketReportTime)
    };
  }

  public static getGdl90FullResponseBody(
    req: Request
  ): string {
    return '';
  }
}

setInterval(Gdl90Client.checkWebSocket, SecondsToCheckSocketClient * 1000);