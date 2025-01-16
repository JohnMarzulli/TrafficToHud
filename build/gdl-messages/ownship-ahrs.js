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
exports.OwnshipAhrs = void 0;
var console_1 = require("console");
var logging_object_1 = require("../logging-object");
var decoded_gdl90_message_1 = require("./decoded-gdl90-message");
var OwnshipAhrs = /** @class */ (function (_super) {
    __extends(OwnshipAhrs, _super);
    function OwnshipAhrs(message) {
        var _this = _super.call(this, logging_object_1.LogLevel.error) || this;
        var subType = message.message[2];
        console_1.assert(message.messageType == 101);
        console_1.assert(subType == 1);
        // Uses 3.5.1
        _this.LogSpew("OWNSHIP AHRS: Data=" + message.message);
        return _this;
    }
    return OwnshipAhrs;
}(decoded_gdl90_message_1.DecodedGdl90Message));
exports.OwnshipAhrs = OwnshipAhrs;
//# sourceMappingURL=ownship-ahrs.js.map