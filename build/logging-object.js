"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingObject = exports.LogLevel = void 0;
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
    function LoggingObject(logLevel) {
        if (logLevel === void 0) { logLevel = LogLevel.debug; }
        this.logLevel = logLevel;
    }
    LoggingObject.prototype.LogSpew = function (text) {
        if (this.logLevel <= LogLevel.spew) {
            console.log(text);
        }
    };
    LoggingObject.prototype.LogInfo = function (text) {
        if (this.logLevel <= LogLevel.info) {
            console.log(text);
        }
    };
    LoggingObject.prototype.LogDebug = function (text) {
        if (this.logLevel <= LogLevel.debug) {
            console.debug(text);
        }
    };
    LoggingObject.prototype.LogError = function (text) {
        if (this.logLevel <= LogLevel.error) {
            console.error(text);
        }
    };
    LoggingObject.prototype.LogErrorDetails = function (text, details) {
        if (this.logLevel <= LogLevel.error) {
            console.error(text, details);
        }
    };
    return LoggingObject;
}());
exports.LoggingObject = LoggingObject;
//# sourceMappingURL=logging-object.js.map