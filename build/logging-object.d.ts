export declare enum LogLevel {
    all = 0,
    spew = 1,
    info = 2,
    debug = 3,
    error = 4,
    none = 5
}
export declare abstract class LoggingObject {
    private readonly logLevel;
    constructor(log_level?: LogLevel);
    protected LogSpew(text: string): void;
    protected LogInfo(text: string): void;
    protected LogDebug(text: string): void;
    protected LogError(text: string): void;
    protected LogErrorDetails(text: string, details: any): void;
}
