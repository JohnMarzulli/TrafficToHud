export declare enum LogLevel {
    all = 0,
    spew = 1,
    info = 2,
    debug = 3,
    error = 4,
    none = 5
}
export declare abstract class LoggingObject {
    constructor(baseFileName: string, logLevel?: LogLevel, maxFileSize?: number, backupCount?: number);
    protected LogSpew(text: string): void;
    protected LogInfo(text: string): void;
    protected LogDebug(text: string): void;
    protected LogError(text: string): void;
    protected LogErrorDetails(text: string, details: any): void;
    private write;
    private rotateIfNeeded;
    private readonly logLevel;
    private readonly filePath;
    private readonly maxBytes;
    private readonly backupCount;
}
