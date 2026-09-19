"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiskLogger = void 0;
var fs = require("fs");
var os = require("os");
var path = require("path");
/**
 * Class to wrap logging to be somewhat neat.
 */
var DiskLogger = /** @class */ (function () {
    function DiskLogger(systemName) {
        var dateTimeFilenamePart = new Date().toISOString().replace(/[:.]/g, '_');
        var targetFilePath = systemName.replace(/\s+/g, '_') + "_" + dateTimeFilenamePart + ".log";
        ;
        var logFilePath = path.join(os.tmpdir(), targetFilePath);
        try {
            this.fileHandle = fs.createWriteStream(logFilePath);
        }
        catch (error) {
            console.error('Failed to create log file:', error);
            this.fileHandle = null;
        }
    }
    /**
     * Log a generic message or data (INFO level)
     * @param message The message to be logged
     */
    DiskLogger.prototype.log = function (message) {
        this.internalLog(message, 'INFO');
    };
    /**
     * Log an error message (ERROR level)
     * @param message The error message to be logged
     */
    DiskLogger.prototype.error = function (message) {
        this.internalLog(message, 'ERROR');
    };
    DiskLogger.prototype.internalLog = function (message, level) {
        var timestamp = new Date().toISOString();
        var stampedMessage = "[" + timestamp + "] - " + level.padEnd(5) + " - " + message;
        console.log(stampedMessage);
        if (this.fileHandle) {
            this.fileHandle.write(stampedMessage + '\n');
        }
    };
    return DiskLogger;
}());
exports.DiskLogger = DiskLogger;
//# sourceMappingURL=disk-logger.js.map