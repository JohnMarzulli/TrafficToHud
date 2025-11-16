import * as WebSocket from "ws";
import { LogLevel } from "../logging-object";
import { SocketClient } from "./socket-client";

const KnownTrafficKey: string = "known_traffic";
const IcaoAddressKey: string = "Icao_addr";
const ReportReceivedKey: string = "ReportReceivedAt";
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

    if (this.responsePackage == null || this.responsePackage == undefined) {
      this.responsePackage = json;
    }

    if (!this.keyInPackage(this.responsePackage, KnownTrafficKey)) {
      this.responsePackage[KnownTrafficKey] = {};
    }

    if (this.keyInPackage(json, IcaoAddressKey)) {
      const trafficKey = json[IcaoAddressKey];

      json[ReportReceivedKey] = Date.now();

      this.responsePackage[KnownTrafficKey][trafficKey] = json;
    } else {
      const merged = { ...this.responsePackage, ...json };
      this.responsePackage = merged;
    }
  }

  protected handleMessage(data: WebSocket.Data): void {
    super.handleMessage(data);

    if (!this.keyInPackage(this.responsePackage, KnownTrafficKey)) {
      return;
    }

    let gcedRadar = {};

    for (const key in this.responsePackage[KnownTrafficKey]) {
      const lastReceivedTime: number = this.responsePackage[KnownTrafficKey][key][ReportReceivedKey];
      const lastReceivedAge: number = (Date.now() - lastReceivedTime) / 1000.0;
      const stratuxAge: number = this.responsePackage[KnownTrafficKey][key][AgeKey];

      if (stratuxAge >= this.TrafficRemovalPeriodSeconds || lastReceivedAge >= this.TrafficRemovalPeriodSeconds) {
        this.LogSpew(`${this.socketName}: GCed ${key}`);
      }
      else {
        gcedRadar[key] = this.responsePackage[KnownTrafficKey][key];
      }
    }

    this.responsePackage[KnownTrafficKey] = gcedRadar;
  }
}