import { LogLevel, SocketClient } from "./socket_client";
import * as WebSocket from "ws";

const KnownTrafficKey: string = "known_traffic";
const IcaoAddressKey: string = "Icao_addr";
const ReportRecivedKey: string = "ReportReceivedAt";
const AgeKey = "Age";


export class RadarClient extends SocketClient {
  private readonly TrafficRemovalPeriodSeconds: number = 60.0;

  constructor() {
    super("RADAR", "radar", LogLevel.debug);
  }

  protected report(report: string) {
    let json = JSON.parse(report);

    if (json == null || json == undefined) {
      json = {};
    }

    if (this.response_package == null || this.response_package == undefined) {
      this.response_package = json;
    }

    if (!this.keyInPackage(this.response_package, KnownTrafficKey)) {
      this.response_package[KnownTrafficKey] = {};
    }

    if (this.keyInPackage(json, IcaoAddressKey)) {
      const trafficKey = json[IcaoAddressKey];

      json[ReportRecivedKey] = Date.now();

      this.response_package[KnownTrafficKey][trafficKey] = json;
    } else {
      const merged = { ...this.response_package, ...json };
      this.response_package = merged;
    }
  }

  protected handleMessage(data: WebSocket.Data): void {
    super.handleMessage(data);

    if (!this.keyInPackage(this.response_package, KnownTrafficKey)) {
      return;
    }

    let gcedRadar = {};

    for (const key in this.response_package[KnownTrafficKey]) {
      const lastReceivedTime: number = this.response_package[KnownTrafficKey][key][ReportRecivedKey];
      const lastRecievedAge: number = (Date.now() - lastReceivedTime) / 1000.0;
      const stratuxAge: number = this.response_package[KnownTrafficKey][key][AgeKey];

      if (stratuxAge >= this.TrafficRemovalPeriodSeconds || lastRecievedAge >= this.TrafficRemovalPeriodSeconds) {
        this.LogDebug(`GCed ${key}`);
      }
      else {
        gcedRadar[key] = this.response_package[KnownTrafficKey][key];
      }
    }

    this.response_package[KnownTrafficKey] = gcedRadar;
  }
}