/**
 * Class to wrap logging to be somewhat neat.
 */
export declare class DiskLogger {
    constructor(systemName: string);
    /**
     * Log a generic message or data (INFO level)
     * @param message The message to be logged
     */
    log(message: string): void;
    /**
     * Log an error message (ERROR level)
     * @param message The error message to be logged
     */
    error(message: string): void;
    private internalLog;
    private readonly logFilePath;
    private readonly fileHandle;
}
