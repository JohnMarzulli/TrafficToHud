import { SocketClient } from "./socket-client";
import { LogLevel } from "./logging-object";

export class StatusClient extends SocketClient {
  constructor() {
    super("STATUS", "status", LogLevel.error);
  }
}