export enum LogLevel {
    all = 0,
    spew,
    info,
    debug,
    error,
    none
};

export abstract class LoggingObject {
    private log_level: LogLevel;

    public constructor(
        log_level: LogLevel = LogLevel.debug
    ) {
        this.log_level = log_level;
    }

    protected LogSpew(text: string) {
        if (this.log_level <= LogLevel.spew) { console.log(text); }
    }

    protected LogInfo(text: string) {
        if (this.log_level <= LogLevel.info) { console.log(text); }
    }

    protected LogDebug(text: string) {
        if (this.log_level <= LogLevel.debug) { console.debug(text); }
    }

    protected LogError(text: string) {
        if (this.log_level <= LogLevel.error) { console.error(text); }
    }

    protected LogErrorDetails(text: string, details: any) {
        if (this.log_level <= LogLevel.error) { console.error(text, details); }
    }
}