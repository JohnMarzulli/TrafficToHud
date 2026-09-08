"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingObject = exports.LogLevel = void 0;
var fs = require("fs");
var path = require("path");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["all"] = 0] = "all";
    LogLevel[LogLevel["spew"] = 1] = "spew";
    LogLevel[LogLevel["info"] = 2] = "info";
    LogLevel[LogLevel["debug"] = 3] = "debug";
    LogLevel[LogLevel["error"] = 4] = "error";
    LogLevel[LogLevel["none"] = 5] = "none";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
;
var LoggingObject = /** @class */ (function () {
    function LoggingObject(baseFileName, logLevel, maxFileSize, backupCount) {
        if (logLevel === void 0) { logLevel = LogLevel.debug; }
        if (maxFileSize === void 0) { maxFileSize = 1048576; }
        if (backupCount === void 0) { backupCount = 10; }
        this.logLevel = logLevel;
        this.filePath = path.resolve(baseFileName + ".log");
        this.maxBytes = maxFileSize;
        this.backupCount = backupCount;
    }
    LoggingObject.prototype.LogSpew = function (text) {
        if (this.logLevel <= LogLevel.spew) {
            console.log(text);
            this.write("SPEW", text);
        }
    };
    LoggingObject.prototype.LogInfo = function (text) {
        if (this.logLevel <= LogLevel.info) {
            console.log(text);
            this.write("INFO", text);
        }
    };
    LoggingObject.prototype.LogDebug = function (text) {
        if (this.logLevel <= LogLevel.debug) {
            console.debug(text);
            this.write("DEBUG", text);
        }
    };
    LoggingObject.prototype.LogError = function (text) {
        this.write("ERROR", text);
        if (this.logLevel <= LogLevel.error) {
            console.error(text);
        }
    };
    LoggingObject.prototype.LogErrorDetails = function (text, details) {
        var errorDetails = details.toString();
        if (details.error !== undefined) {
            errorDetails = details.error.toString();
        }
        this.write("ERROR", text + " -- " + errorDetails);
        if (this.logLevel <= LogLevel.error) {
            console.error(text, details);
        }
    };
    LoggingObject.prototype.write = function (level, line) {
        this.rotateIfNeeded();
        var dateTimeString = new Date().toISOString();
        fs.appendFileSync(this.filePath, dateTimeString + " - " + level + " - " + line + "\n");
    };
    LoggingObject.prototype.rotateIfNeeded = function () {
        var size = 0;
        try {
            size = fs.statSync(this.filePath).size;
        }
        catch (_a) {
            return;
        }
        if (size < this.maxBytes)
            return;
        for (var i = this.backupCount - 1; i > 0; i--) {
            var src = this.filePath + "." + i;
            var dst = this.filePath + "." + (i + 1);
            if (fs.existsSync(src))
                fs.renameSync(src, dst);
        }
        fs.renameSync(this.filePath, this.filePath + ".1");
    };
    return LoggingObject;
}());
exports.LoggingObject = LoggingObject;
//# sourceMappingURL=logging-object.js.map