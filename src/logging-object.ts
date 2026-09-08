import * as fs from "fs";
import * as path from "path";

export enum LogLevel {
    all = 0,
    spew,
    info,
    debug,
    error,
    none
};

export abstract class LoggingObject {
    public constructor(
        baseFileName: string,
        logLevel: LogLevel = LogLevel.debug,
        maxFileSize: number = 1048576,
        backupCount: number = 10
    ) {
        this.logLevel = logLevel;
        this.filePath = path.resolve(`${baseFileName}.log`);
        this.maxBytes = maxFileSize;
        this.backupCount = backupCount;
    }

    protected LogSpew(
        text: string
    ) {
        if (this.logLevel <= LogLevel.spew) {
            console.log(text);
            this.write("SPEW", text);
        }
    }

    protected LogInfo(
        text: string
    ) {
        if (this.logLevel <= LogLevel.info) {
            console.log(text);
            this.write("INFO", text);
        }
    }

    protected LogDebug(text: string) {
        if (this.logLevel <= LogLevel.debug) {
            console.debug(text);
            this.write("DEBUG", text);
        }
    }

    protected LogError(
        text: string
    ) {
        this.write("ERROR", text);

        if (this.logLevel <= LogLevel.error) {
            console.error(text);
        }
    }

    protected LogErrorDetails(
        text: string,
        details: any
    ) {
        var errorDetails = details.toString();

        if (details.error !== undefined) {
            errorDetails = details.error.toString();
        }

        this.write("ERROR", `${text} -- ${errorDetails}`);

        if (this.logLevel <= LogLevel.error) { console.error(text, details); }
    }

    private write(
        level: string,
        line: string
    ): void {
        this.rotateIfNeeded();
        const dateTimeString: string = new Date().toISOString();
        fs.appendFileSync(this.filePath, `${dateTimeString} - ${level} - ${line}\n`);
    }

    private rotateIfNeeded(): void {
        let size = 0;
        try { size = fs.statSync(this.filePath).size; } catch { return; }
        if (size < this.maxBytes) return;

        for (let i = this.backupCount - 1; i > 0; i--) {
            const src = `${this.filePath}.${i}`;
            const dst = `${this.filePath}.${i + 1}`;
            if (fs.existsSync(src)) fs.renameSync(src, dst);
        }
        fs.renameSync(this.filePath, `${this.filePath}.1`);
    }

    private readonly logLevel: LogLevel;
    private readonly filePath: string;
    private readonly maxBytes: number;
    private readonly backupCount: number;
}