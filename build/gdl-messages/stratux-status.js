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
exports.StratuxStatus = void 0;
var console_1 = require("console");
var logging_object_1 = require("../logging-object");
var decoded_gdl90_message_1 = require("./decoded-gdl90-message");
var StratuxStatus = /** @class */ (function (_super) {
    __extends(StratuxStatus, _super);
    function StratuxStatus(message) {
        var _this = _super.call(this, logging_object_1.LogLevel.error) || this;
        console_1.assert(message.messageType == 83);
        // Stratux Status
        // from gen_gdl90.go:495
        _this.LogSpew("STRATUX: SoftVer=" + message.rawMessage.substring(5, 8) + ", HardVer=" + message.rawMessage.substring(9, 12) + ", DataValid=" + message.message[14] + ", Unk=" + message.message[15] + ", HardStatus=" + message.message[16] + ", GpsLock=" + message.message[17] + ", Towers=" + message.message.subarray(29));
        return _this;
    }
    return StratuxStatus;
}(decoded_gdl90_message_1.DecodedGdl90Message));
exports.StratuxStatus = StratuxStatus;
//# sourceMappingURL=stratux-status.js.map