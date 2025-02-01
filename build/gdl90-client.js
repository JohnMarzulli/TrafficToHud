"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gdl90Client = void 0;
var socket_client_1 = require("./socket-client");
var logging_object_1 = require("./logging-object");
var GdlMessages = require("./gdl-messages/gdl90-message");
var MessageCountsKey = "msg_counts";
var Gdl90Client = /** @class */ (function (_super) {
    __extends(Gdl90Client, _super);
    function Gdl90Client() {
        return _super.call(this, "GDL90", "gdl90", logging_object_1.LogLevel.debug) || this;
    }
    Gdl90Client.prototype.decode = function (data) {
        if (data == undefined || data == null) {
            return '';
        }
        return this.decodeBase64(data.toString());
    };
    Gdl90Client.prototype.report = function (report) {
        if (report == null) {
            this.LogError("Empty report!");
            return;
        }
        // It appears that Stratux may decided to batch multiple small reports
        // into a single WebSocket transmission
        var reports = report.split("~");
        for (var splitReportIndex in reports) {
            var splitReport = reports[splitReportIndex];
            if (splitReport.length <= 0) {
                continue;
            }
            this.decodeReport("~" + splitReport + "~");
        }
    };
    Gdl90Client.prototype.decodeReport = function (report) {
        try {
            var decodedBytes = new Uint8Array(report.length);
            for (var i = 0; i < report.length; i++) {
                decodedBytes[i] = report.charCodeAt(i);
            }
            if (decodedBytes[0] !== 0x7E || decodedBytes[decodedBytes.length - 1] !== 0x7E) {
                this.LogError("Invalid GDL90 frame boundaries.");
                return;
            }
            // The frame delimiters are being intentionally
            // left in so the byte index from the specs
            // (https://www.foreflight.com/connect/spec/)
            // will match the indices references.
            var processedMessage = new GdlMessages.Gdl90Message(report);
            this.addToMessageHistory(processedMessage);
        }
        catch (e) {
            this.LogErrorDetails("Issue merging report into cache.", e);
        }
    };
    Gdl90Client.prototype.addToMessageHistory = function (message) {
        var deframedReport = message.message.slice(1, -1);
        var messageType = message.messageType.toString();
        if (!this.keyInPackage(this.response_package, MessageCountsKey)) {
            this.response_package[MessageCountsKey] = {};
        }
        if (!this.keyInPackage(this.response_package[MessageCountsKey], messageType)) {
            this.response_package[MessageCountsKey][messageType] = 1;
        }
        else {
            this.response_package[MessageCountsKey][messageType] += 1;
        }
        if (!this.keyInPackage(this.response_package, "last_msg")) {
            this.response_package["last_msg"] = {};
        }
        if (!(messageType in this.response_package["last_msg"])) {
            this.response_package["last_msg"][messageType] = [];
        }
        this.response_package["last_msg"][messageType].push({
            'recievedAt': message.receivedAt,
            'report': deframedReport.toString()
        });
        if (this.response_package["last_msg"][messageType].length > 10) {
            this.response_package["last_msg"][messageType] = this.response_package["last_msg"][messageType].slice(-10);
        }
    };
    Gdl90Client.prototype.decodeBase64 = function (base64) {
        // Decode the Base64 string
        var preparedString = base64.replace('"', '');
        preparedString = preparedString.replace('"', '');
        return Buffer.from(preparedString, "base64").toString();
    };
    return Gdl90Client;
}(socket_client_1.SocketClient));
exports.Gdl90Client = Gdl90Client;
//# sourceMappingURL=gdl90-client.js.map