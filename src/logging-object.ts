export enum LogLevel {
    all = 0,
    spew,
    info,
    debug,
    error,
    none
};

export abstract class LoggingObject {
    private readonly logLevel: LogLevel;

    public constructor(
        logLevel: LogLevel = LogLevel.debug
    ) {
        this.logLevel = logLevel;
    }

    protected LogSpew(text: string) {
        if (this.logLevel <= LogLevel.spew) { console.log(text); }
    }

    protected LogInfo(text: string) {
        if (this.logLevel <= LogLevel.info) { console.log(text); }
    }

    protected LogDebug(text: string) {
        if (this.logLevel <= LogLevel.debug) { console.debug(text); }
    }

    protected LogError(text: string) {
        if (this.logLevel <= LogLevel.error) { console.error(text); }
    }

    protected LogErrorDetails(text: string, details: any) {
        if (this.logLevel <= LogLevel.error) { console.error(text, details); }
    }
}