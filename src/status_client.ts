import { SocketClient } from "./socket_client";
import { LogLevel } from "./logging_object";

export class StatusClient extends SocketClient {
  constructor() {
    super("STATUS", "status", LogLevel.error);
  }
}