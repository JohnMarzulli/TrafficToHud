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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketClient = void 0;
var WebSocket = require("ws");
var logging_object_1 = require("../logging-object");
var SocketClient = /** @class */ (function (_super) {
    __extends(SocketClient, _super);
    function SocketClient(socketName, route, logLevel) {
        if (logLevel === void 0) { logLevel = logging_object_1.LogLevel.error; }
        var _this = _super.call(this, logLevel) || this;
        _this.StratuxAddress = "192.168.10.1";
        _this.checkInterval = 10000; // 10 seconds
        _this.responsePackage = {};
        _this.webSocketClient = null;
        _this.lastMessageTime = 0;
        _this.intervalId = null;
        _this.socketName = socketName;
        _this.route = route;
        _this.url = "ws://" + _this.StratuxAddress + "/" + _this.route;
        _this.start();
        return _this;
    }
    SocketClient.prototype.start = function () {
        this.connect();
        this.reconnectOnTimeout();
    };
    SocketClient.prototype.reset = function () {
        if (this.webSocketClient != null) {
            this.webSocketClient.close();
            this.webSocketClient = null;
        }
        this.connect();
    };
    SocketClient.prototype.connect = function () {
        var _this = this;
        this.webSocketClient = new WebSocket(this.url);
        this.webSocketClient.onopen = function () { return _this.handleOpen(); };
        this.webSocketClient.onmessage = function (event) { return _this.handleMessage(event.data); };
        this.webSocketClient.onclose = function () { return _this.LogInfo(_this.socketName + ": closed"); };
        this.webSocketClient.onerror = function (error) { return _this.LogErrorDetails(_this.socketName + ": error", error); };
    };
    SocketClient.prototype.handleOpen = function () {
        this.LogInfo(this.socketName + ": connected");
        this.lastMessageTime = Date.now();
    };
    SocketClient.prototype.handleMessage = function (data) {
        this.lastMessageTime = Date.now();
        var decoded = this.decode(data);
        this.LogSpew(this.socketName + " RAW: " + data.toString());
        this.LogInfo(this.socketName + " decoded: " + decoded);
        this.report(decoded);
    };
    SocketClient.prototype.reconnectOnTimeout = function () {
        var _this = this;
        this.intervalId = setInterval(function () {
            if (Date.now() - _this.lastMessageTime > _this.checkInterval) {
                _this.reconnect();
            }
        }, this.checkInterval);
    };
    SocketClient.prototype.reconnect = function () {
        this.LogInfo(this.socketName + ": Reconnecting...");
        if (this.webSocketClient) {
            this.webSocketClient.close();
        }
        this.connect();
    };
    SocketClient.prototype.getSecondsSince = function () {
        if (this.lastMessageTime == null) {
            return 0.0;
        }
        return (Date.now() - this.lastMessageTime) / 1000;
    };
    SocketClient.prototype.decode = function (data) { return data.toString(); };
    SocketClient.prototype.report = function (report) {
        var json = JSON.parse(report);
        if (json == null || json == undefined) {
            json = {};
        }
        if (this.responsePackage == null || this.responsePackage == undefined) {
            this.responsePackage = json;
        }
        else {
            var merged = __assign(__assign({}, this.responsePackage), json);
            this.responsePackage = merged;
        }
    };
    SocketClient.prototype.keyInPackage = function (dataPackage, key) {
        if (dataPackage == null || dataPackage == undefined) {
            return false;
        }
        if (key == null || key == undefined) {
            return false;
        }
        if (dataPackage[key] == undefined || !(key in dataPackage)) {
            return false;
        }
        return true;
    };
    SocketClient.prototype.getServiceStatus = function (req) {
        return {
            "service_name": this.socketName,
            socketStatus: this.webSocketClient != null ? this.webSocketClient.readyState : 0,
            socketTimeSinceLastTraffic: this.getSecondsSince()
        };
    };
    SocketClient.prototype.getServiceResponse = function (req) {
        if (req == null || this.responsePackage == null) {
            return {};
        }
        return this.responsePackage;
    };
    return SocketClient;
}(logging_object_1.LoggingObject));
exports.SocketClient = SocketClient;
//# sourceMappingURL=socket-client.js.map