import { LoggingObject, LogLevel } from "../logging-object";

export abstract class DecodedGdl90Message extends LoggingObject {
    public constructor(
        logLevel: LogLevel = LogLevel.debug
    ) {
        super(logLevel);
    }
}
