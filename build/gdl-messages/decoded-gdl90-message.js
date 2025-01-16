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
exports.DecodedGdl90Message = void 0;
var logging_object_1 = require("../logging-object");
var DecodedGdl90Message = /** @class */ (function (_super) {
    __extends(DecodedGdl90Message, _super);
    function DecodedGdl90Message(log_level) {
        if (log_level === void 0) { log_level = logging_object_1.LogLevel.debug; }
        return _super.call(this, log_level) || this;
    }
    return DecodedGdl90Message;
}(logging_object_1.LoggingObject));
exports.DecodedGdl90Message = DecodedGdl90Message;
//# sourceMappingURL=decoded-gdl90-message.js.map