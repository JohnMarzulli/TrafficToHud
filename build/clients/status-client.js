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
exports.StatusClient = void 0;
var logging_object_1 = require("../logging-object");
var socket_client_1 = require("./socket-client");
var StatusClient = /** @class */ (function (_super) {
    __extends(StatusClient, _super);
    function StatusClient() {
        return _super.call(this, "STATUS", "status", logging_object_1.LogLevel.error) || this;
    }
    return StatusClient;
}(socket_client_1.SocketClient));
exports.StatusClient = StatusClient;
//# sourceMappingURL=status-client.js.map