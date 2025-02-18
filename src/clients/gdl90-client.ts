import * as WebSocket from "ws";
import * as GdlMessages from "../gdl-messages/gdl90-message";
import { LogLevel } from "../logging-object";
import { SocketClient } from "./socket-client";

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
      const processedMessage: GdlMessages.Gdl90Message = new GdlMessages.Gdl90Message(report);

      this.addToMessageHistory(processedMessage);
    } catch (e) {
      this.LogErrorDetails("Issue merging report into cache.", e);
    }
  }

  private addToMessageHistory(
    message: GdlMessages.Gdl90Message
  ): void {
    const deframedReport: Uint8Array = message.message.slice(1, -1);
    const messageType = message.messageType.toString();

    if (!this.keyInPackage(this.responsePackage, MessageCountsKey)) {
      this.responsePackage[MessageCountsKey] = {};
    }

    if (!this.keyInPackage(this.responsePackage[MessageCountsKey], messageType)) {
      this.responsePackage[MessageCountsKey][messageType] = 1;
    } else {
      this.responsePackage[MessageCountsKey][messageType] += 1;
    }

    if (!this.keyInPackage(this.responsePackage, "last_msg")) {
      this.responsePackage["last_msg"] = {};
    }

    if (!(messageType in this.responsePackage["last_msg"])) {
      this.responsePackage["last_msg"][messageType] = [];
    }

    this.responsePackage["last_msg"][messageType].push(
      {
        'recievedAt': message.receivedAt,
        'report': deframedReport.toString()
      }
    );

    if (this.responsePackage["last_msg"][messageType].length > 10) {
      this.responsePackage["last_msg"][messageType] = this.responsePackage["last_msg"][messageType].slice(-10);
    }
  }

  private decodeBase64(base64: string): string {
    // Decode the Base64 string
    let preparedString: string = base64.replace('"', '');
    preparedString = preparedString.replace('"', '');

    return Buffer.from(preparedString, "base64").toString();
  }
}