import { SocketClient } from "./socket_client";
import * as DataHandling from "./data_handling";
import * as WebSocket from "ws";
import { LogLevel } from "./logging_object";
import * as GdlMessages from "./Messages/gdl90";

const MessageCountsKey: string = "msg_counts";

export class Gdl90Client extends SocketClient {
  constructor() {
    super("GDL90", "gdl90", LogLevel.debug);
  }

  protected decode(
    data: WebSocket.Data
  ): string {
    if (data == undefined || data == null) {
      return '';
    }

    return this.decodeBase64(data.toString());
  }

  protected report(report: string) {
    if (report == null) {
      this.LogError("Empty report!");

      return;
    }

    // It appears that Stratux may decided to batch multiple small reports
    // into a single WebSocket transmission
    const reports: string[] = report.split(`~`);

    for (const splitReportIndex in reports) {
      const splitReport: string = reports[splitReportIndex];

      if (splitReport.length <= 0) { continue; }

      this.decodeReport(`~${splitReport}~`);
    }
  }

  protected decodeReport(report: string) {
    try {
      const decodedBytes = new Uint8Array(report.length);

      for (let i = 0; i < report.length; i++) {
        decodedBytes[i] = report.charCodeAt(i);
      }

      if (decodedBytes[0] !== 0x7E || decodedBytes[decodedBytes.length - 1] !== 0x7E) {
        this.LogError("Invalid GDL90 frame boundaries.");

        return;
      }

      // The frame delimiters are being intentionally
      // left in so the byte index from the specs
      // (https://www.foreflight.com/connect/spec/)
      // will match the indices references.

      const unescapedData: Uint8Array = DataHandling.unescapeData(decodedBytes);
      const messageType: string = unescapedData[1].toString();
      const messageTypeHex: string = unescapedData[1].toString(16);
      const deframedReport: string = report.slice(1, -1);

      const undecodedMessage: GdlMessages.Gdl90 = new GdlMessages.Gdl90(report);
      let message: GdlMessages.Gdl90Message = null;

      switch (messageType) {
        case '0':
          message = new GdlMessages.GdlHeartbeat(undecodedMessage);
          break;
        case '10':
          message = new GdlMessages.Ownship(undecodedMessage);
          break;
        case '11':
          message = new GdlMessages.OwnshipAltitude(undecodedMessage);
          break;
        case '101':
          const subType = unescapedData[2];
          message = subType == 0
            ? new GdlMessages.OwnshipDetails(undecodedMessage)
            : new GdlMessages.OwnshipAhrs(undecodedMessage);
          break;
        case '20':
          message = new GdlMessages.Traffic(undecodedMessage);
          break;
        case '204':
          message = new GdlMessages.StratuxHeartbeat(undecodedMessage);
          break;
        case '30':
          message = new GdlMessages.BasicReport(undecodedMessage);
          break;
        case '31':
          message = new GdlMessages.LongReport(undecodedMessage);
          break;
        case '7':
          message = new GdlMessages.Uplink(undecodedMessage);
          break;
        case '83':
          message = new GdlMessages.StratuxStatus(undecodedMessage);
          break;
        default:
          this.LogError(`UNKNOWN:${messageType}/0x${messageTypeHex} - ${report}`);
      }

      if (!this.keyInPackage(this.response_package, MessageCountsKey)) {
        this.response_package[MessageCountsKey] = {};
      }

      if (!this.keyInPackage(this.response_package[MessageCountsKey], messageType)) {
        this.response_package[MessageCountsKey][messageType] = 1;
      } else {
        this.response_package[MessageCountsKey][messageType] += 1;
      }

      if (!this.keyInPackage(this.response_package, "last_msg")) {
        this.response_package["last_msg"] = {};
      }

      this.response_package["last_msg"][messageType] = deframedReport;

      //WeatherReport.parseGdl90Weather(payload);
    } catch (e) {
      this.LogErrorDetails("Issue merging report into cache.", e);
    }
  }

  private decodeBase64(base64: string): string {
    // Decode the Base64 string
    let preparedString: string = base64.replace('"', '');
    preparedString = preparedString.replace('"', '');

    return atob(preparedString);
  }
}