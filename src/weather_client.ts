import * as WebSocket from "ws";

const StratuxAddress: string = "192.168.10.1";
const SecondsToCheckSocketClient: number = 1;
const WebSocketTimeoutSeconds: number = 60;


class JsonPackage extends Map<string, any> { }
class WeatherResponsePackage extends Map<string, JsonPackage> { }

let lastWebsocketReportTime: number = 0;
let radarWebSocketClient: WebSocket;

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

function reportWeather(
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

export class WeatherClient {
  public static resetWebSocketClient(): void {
    this.createWebSocketClient();
  }

  public static createWebSocketClient(): void {
    if (radarWebSocketClient != null) {
      console.log("Weather Socket closed by createWebSocket");
      radarWebSocketClient.close();
    }

    radarWebSocketClient = new WebSocket(`ws://${StratuxAddress}/weather`);

    radarWebSocketClient.onopen = function () {
      console.log("Weather Socket open");
      lastWebsocketReportTime = Date.now();
    };

    radarWebSocketClient.onerror = function (error) {
      console.error(`WEATHER ERROR:${error.message}`);
    };

    radarWebSocketClient.onmessage = function (message) {
      console.log(`Weather: ${message.data.toString()}`);
      lastWebsocketReportTime = Date.now();

      try {
        const json = JSON.parse(message.data.toString());
        reportWeather(json);
      } catch (e) {
        console.log(`${e}: Error handling weather report:`, message.data);
      }
    };
  }
  public static checkWebSocket(): void {
    if (radarWebSocketClient == null
      || getSecondsSince(lastWebsocketReportTime) > WebSocketTimeoutSeconds) {
        console.log(`Weather Socket not heard from in ${WebSocketTimeoutSeconds} seconds`);
      WeatherClient.createWebSocketClient();
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

  public static getWeatherFullResponseBody(
    req: Request
  ): string {
    return '';
  }
}

setInterval(WeatherClient.checkWebSocket, SecondsToCheckSocketClient * 1000);