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
exports.HeartbeatMessage = void 0;
var console_1 = require("console");
var logging_object_1 = require("../logging-object");
var decoded_gdl90_message_1 = require("./decoded-gdl90-message");
var HeartbeatMessage = /** @class */ (function (_super) {
    __extends(HeartbeatMessage, _super);
    // It is ALWAYS
    // ID: 253
    // 126,253,4,4,253,126
    function HeartbeatMessage(message) {
        var _this = _super.call(this, logging_object_1.LogLevel.error) || this;
        console_1.assert(message.messageType == 253);
        // Stratux Status
        // from gen_gdl90.go:495
        _this.LogSpew("Unknown Heartbeat Message: " + message.message);
        return _this;
    }
    return HeartbeatMessage;
}(decoded_gdl90_message_1.DecodedGdl90Message));
exports.HeartbeatMessage = HeartbeatMessage;
//# sourceMappingURL=heartbeat-message.js.map