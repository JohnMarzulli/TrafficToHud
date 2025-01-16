"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coordinate = void 0;
var Coordinate = /** @class */ (function () {
    function Coordinate(longitude, latitude) {
        if (longitude > 180) {
            longitude -= 360;
        }
        this.longitude = longitude;
        this.latitude = latitude;
    }
    Coordinate.prototype.toString = function () {
        return "[lon=" + this.longitude + ", lat=" + this.latitude + "]";
    };
    return Coordinate;
}());
exports.Coordinate = Coordinate;
//# sourceMappingURL=coordinate.js.map