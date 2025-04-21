"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gdl90Message = void 0;
var data_handling_1 = require("../data-handling");
var basic_report_1 = require("./basic-report");
var gdl90_heartbeat_1 = require("./gdl90-heartbeat");
var long_report_1 = require("./long-report");
var ownship_1 = require("./ownship");
var ownship_ahrs_1 = require("./ownship-ahrs");
var ownship_altitude_1 = require("./ownship-altitude");
var ownship_details_1 = require("./ownship-details");
var stratux_heartbeat_1 = require("./stratux-heartbeat");
var stratux_status_1 = require("./stratux-status");
var traffic_1 = require("./traffic");
var uplink_1 = require("./uplink");
/**
 * A GDL90 message that has been received and decoded.
 * Stores the raw message, details, and the decoded message.
 */
var Gdl90Message = /** @class */ (function () {
    function Gdl90Message(rawMessage) {
        this.receivedAt = Date.now();
        this.rawMessage = rawMessage.trim();
        this.message = data_handling_1.unescapeData(data_handling_1.getBytes(this.rawMessage));
        this.messageType = Number(this.message[1].toString());
        this.decodedMessage = getDecodedMessage(this);
    }
    return Gdl90Message;
}());
exports.Gdl90Message = Gdl90Message;
function getDecodedMessage(message) {
    var constructorMap = {
        0: gdl90_heartbeat_1.Gdl90Heartbeat,
        10: ownship_1.Ownship,
        11: ownship_altitude_1.OwnshipAltitude,
        20: traffic_1.Traffic,
        204: stratux_heartbeat_1.StratuxHeartbeat,
        30: basic_report_1.BasicReport,
        31: long_report_1.LongReport,
        7: uplink_1.Uplink,
        83: stratux_status_1.StratuxStatus
    };
    if (message.messageType == 101) {
        var subType = message.message[2];
        return subType == 0
            ? new ownship_details_1.OwnshipDetails(message)
            : new ownship_ahrs_1.OwnshipAhrs(message);
    }
    if (message.messageType in constructorMap) {
        return new constructorMap[message.messageType](message);
    }
    console.error("UNKNOWN MSG:" + message.messageType + " - " + message.message);
    return null;
}
//# sourceMappingURL=gdl90-message.js.map