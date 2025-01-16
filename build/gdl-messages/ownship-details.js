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
exports.OwnshipDetails = void 0;
var console_1 = require("console");
var logging_object_1 = require("../logging-object");
var decoded_gdl90_message_1 = require("./decoded-gdl90-message");
var OwnshipDetails = /** @class */ (function (_super) {
    __extends(OwnshipDetails, _super);
    function OwnshipDetails(message) {
        var _this = _super.call(this, logging_object_1.LogLevel.error) || this;
        var subType = message.message[2];
        console_1.assert(message.messageType == 101);
        console_1.assert(subType == 0);
        // Uses 3.5.1
        _this.LogSpew("OWNSHIP DETAILS: Sub=" + subType + ", DevName=" + message.message.subarray(12, 20) + ", DevLongName=" + message.message.subarray(20, 36));
        return _this;
    }
    return OwnshipDetails;
}(decoded_gdl90_message_1.DecodedGdl90Message));
exports.OwnshipDetails = OwnshipDetails;
//# sourceMappingURL=ownship-details.js.map