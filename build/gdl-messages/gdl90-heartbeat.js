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
exports.Gdl90Heartbeat = void 0;
var console_1 = require("console");
var logging_object_1 = require("../logging-object");
var decoded_gdl90_message_1 = require("./decoded-gdl90-message");
var Gdl90Heartbeat = /** @class */ (function (_super) {
    __extends(Gdl90Heartbeat, _super);
    function Gdl90Heartbeat(message) {
        var _this = _super.call(this, logging_object_1.LogLevel.error) || this;
        console_1.assert(message.messageType == 0);
        _this.LogSpew("HEARTBEAT: Status=" + message.message[2] + "/" + message.message[3] + ", TimeStamp=" + message.message[4] + message.message[5] + ", MsgCounts=" + message.message[6] + message.message[7]);
        return _this;
    }
    return Gdl90Heartbeat;
}(decoded_gdl90_message_1.DecodedGdl90Message));
exports.Gdl90Heartbeat = Gdl90Heartbeat;
//# sourceMappingURL=gdl90-heartbeat.js.map