import { LogLevel } from "../logging-object";
import { SocketClient } from "./socket-client";

export class StatusClient extends SocketClient {
  constructor() {
    super("STATUS", "status", LogLevel.error);
  }
}