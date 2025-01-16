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
exports.StratuxHeartbeat = void 0;
var console_1 = require("console");
var logging_object_1 = require("../logging-object");
var decoded_gdl90_message_1 = require("./decoded-gdl90-message");
var StratuxHeartbeat = /** @class */ (function (_super) {
    __extends(StratuxHeartbeat, _super);
    function StratuxHeartbeat(message) {
        var _this = _super.call(this, logging_object_1.LogLevel.error) || this;
        console_1.assert(message.messageType == 204);
        _this.LogSpew("STRATUX HEARTBEAT:" + message.message);
        return _this;
    }
    return StratuxHeartbeat;
}(decoded_gdl90_message_1.DecodedGdl90Message));
exports.StratuxHeartbeat = StratuxHeartbeat;
//# sourceMappingURL=stratux-heartbeat.js.map