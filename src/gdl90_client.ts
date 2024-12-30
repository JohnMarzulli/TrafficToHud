import * as WebSocket from "ws";
import * as WeatherReport from "./weather_report";
import { LogLevel, SocketClient } from "./socket_client";

const MessageCountsKey: string = "msg_counts";

export class Gdl90Client extends SocketClient {
  constructor() {
    super("GDL90", "gdl90", LogLevel.info);
  }

  protected decode(data: WebSocket.Data): string { return this.decodeBase64(data.toString()); }

  protected report(report: string) {
    try {
      if (report == null) {
        return;
      }

      const decodedBytes = new Uint8Array(report.length);

      for (let i = 0; i < report.length; i++) {
        decodedBytes[i] = report.charCodeAt(i);
      }

      const messageType: string = decodedBytes[0].toString();

      if (!this.keyInPackage(this.response_package, MessageCountsKey)) {
        this.response_package[MessageCountsKey] = {};
      }

      if (!this.keyInPackage(this.response_package[MessageCountsKey], messageType)) {
        this.response_package[MessageCountsKey][messageType] = 1;
      } else {
        this.response_package[MessageCountsKey][messageType] += 1;
      }

      WeatherReport.parseGdl90Weather(decodedBytes);
    } catch (e) {
      console.error(`Issue merging report into cache:${e}`);
    }
  }

  private decodeBase64(base64: string): string {
    // Decode the Base64 string
    let preparedString: string = base64.replace('"', '');
    preparedString = preparedString.replace('"', '');

    return atob(preparedString);
  }
}