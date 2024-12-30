import * as WebSocket from "ws";
import * as WeatherReport from "./weather_report";
import { LogLevel, SocketClient } from "./socket_client";

const MessageCountsKey: string = "msg_counts";

function unescapeData(data: Uint8Array): Uint8Array {
  const ESCAPE_BYTE = 0x7D;
  const XOR_BYTE = 0x20;
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i] === ESCAPE_BYTE && i + 1 < data.length) {
      result.push(data[i + 1] ^ XOR_BYTE);
      i++;
    } else {
      result.push(data[i]);
    }
  }

  return new Uint8Array(result);
}

function calculateChecksum(data: Uint8Array): number {
  return data.reduce((checksum, byte) => checksum ^ byte, 0);
}

export class Gdl90Client extends SocketClient {
  constructor() {
    super("GDL90", "gdl90", LogLevel.debug);
  }

  protected decode(data: WebSocket.Data): string { return this.decodeBase64(data.toString()); }

  protected report(report: string) {
    if (report == null) {
      this.LogError("Empty report!");

      return;
    }

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

      const unescapedData: Uint8Array = unescapeData(decodedBytes);
      const messageType: string = unescapedData[1].toString();
      const messageTypeHex: string = unescapedData[1].toString(16);
      const deframedReport: string = report.slice(1, -1);
      const deframedBytes: Uint8Array = unescapedData.slice(1, -1);

      // Heartbeat
      if (messageType === '0') {
        this.LogSpew(`HEARTBEAT: Status=${unescapedData[2]}/${unescapedData[3]}, TimeStamp=${unescapedData[4]}${unescapedData[5]}, MsgCounts=${unescapedData[6]}${unescapedData[7]}`);
      }
      else if (messageType === '10') {
        this.LogSpew(`OWNSHIP:${deframedReport}`);
      }
      else if (messageType === '11') {
        this.LogSpew(`OWNSHIP ALTITUDE:${deframedReport}`);
      }
      else if (messageType === '101') { // 0x65
        const subType = unescapedData[2];

        if (subType === 0) {
          // Uses 3.5.1
          this.LogInfo(`ID: ${subType}, DevName=${report.substring(12, 19)}, DevLongName=${report.substring(20, 35)}`);
        }
        else {
          this.LogDebug(`AHRS:${deframedReport}`);
        }
      }
      else if (messageType === `20`) {
        // Uses 3.5.1
        // Pg 17 & 18
        // https://www.faa.gov/sites/faa.gov/files/air_traffic/technology/adsb/archival/GDL90_Public_ICD_RevA.PDF
        //if (deframedReport.length != 30) {
        //  this.LogError(`TRAFFIC: report.length=${report.length}`);
        //}
        this.LogSpew(`TRAFFIC:${deframedReport}`);
      }
      else if (messageType === '204') {
        this.LogSpew(`STRATUX HEARBEAT:${deframedReport}`);
      }
      else if (messageType === '30') {
        // Basic report
        // Pg 26, FAA
        // UAT?
        let timeOfReception = deframedBytes.subarray(2, 4);
        let payload = deframedBytes.slice(5);
        let icaoAddress = payload.slice(0, 3); // 3-byte ICAO address
        let flags =  payload[3];               // Flags for type of data
        let latitude = (payload[4] << 16) | (payload[5] << 8) | payload[6]; // Latitude encoding
        let longitude = (payload[7] << 16) | (payload[8] << 8) | payload[9]; // Longitude encoding
        let altitude = (payload[10] << 8) | payload[11]; // Altitude
        let velocity = (payload[12] << 8) | payload[13]; // Velocity
        let additionalData = payload.slice(14); // Any remaining data

        this.LogDebug(`UAT BASIC MSG: TimeReceived=${timeOfReception}, ICAO=${icaoAddress}, flags=${flags}, lat=${latitude}, long=${longitude}, alt=${altitude}, vel=${velocity}, additiona=${additionalData}, `);
      }
      else if (messageType === '31') {
        // Basic report
        // Pg 26, FAA
        // UAT?
        this.LogDebug(`UAT BASIC MSG: TimeReceived=${unescapedData.subarray(2, 4)}, Payload=${report.substring(5, 38)}`);
      }
      else if (messageType === `7`) {
        this.LogDebug(`UAT UPLINK:${deframedReport}`);
      }
      // Stratux Status
      else if (messageType === '83') {
        // from gen_gdl90.go:495
        this.LogSpew(`STRATUX: SoftVer=${unescapedData.subarray(5, 8)}, HardVer=${unescapedData.subarray(9, 12)}, DataValid=${unescapedData[14]}, Unk=${unescapedData[15]}, HardStatus=${unescapedData[16]}, GpsLock=${unescapedData[17]}, Towers=${unescapedData.subarray(29)}`);
      }
      else {
        this.LogDebug(`PROCESSING:${messageType}/0x${messageTypeHex} - ${report}`);
      }

      //      const payload = unescapedData.slice(1, -1);

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