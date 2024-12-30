import { LogLevel, SocketClient } from "./socket_client";

export class StatusClient extends SocketClient {
  constructor() {
    super("STATUS", "status", LogLevel.error);
  }
}