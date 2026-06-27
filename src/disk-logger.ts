import * as fs from 'fs';

/**
 * Class to wrap logging to be somewhat neat.
 */
export class DiskLogger {
    constructor(
        systemName: string
    ) {
        const dateTimeFilenamePart = new Date().toISOString().replace(/[:.]/g, '_');
        this.logFilePath = `${systemName.replace(/\s+/g, '_')}_${dateTimeFilenamePart}.log`;

        try {
            this.fileHandle = fs.createWriteStream(this.logFilePath);
        } catch (error) {
            console.error('Failed to create log file:', error);
            this.fileHandle = null;
        }
    }

    /**
     * Log a generic message or data (INFO level)
     * @param message The message to be logged
     */
    public log(
        message: string
    ): void {
        this.internalLog(message, 'INFO');
    }

    /**
     * Log an error message (ERROR level)
     * @param message The error message to be logged
     */
    public error(
        message: string
    ): void {
        this.internalLog(message, 'ERROR');
    }

    private internalLog(
        message: string,
        level: 'INFO' | 'ERROR'
    ) {
        const timestamp = new Date().toISOString();
        const stampedMessage = `[${timestamp}] - ${level.padEnd(5)} - ${message}`;

        console.log(stampedMessage);

        if (this.fileHandle) {
            this.fileHandle.write(stampedMessage + '\n');
        }
    }

    private readonly logFilePath: string;
    private readonly fileHandle: fs.WriteStream | null;
}