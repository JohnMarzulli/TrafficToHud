import { LoggingObject, LogLevel } from "../logging-object";

export abstract class DecodedGdl90Message extends LoggingObject {
    public constructor(
        log_level: LogLevel = LogLevel.debug
    ) {
        super(log_level);
    }
}
