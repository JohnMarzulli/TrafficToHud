"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coordinate = void 0;
/**
 * GPS coordinates.
 */
var Coordinate = /** @class */ (function () {
    /**
     * Form a coordinate
     * @param longitude The East to West cooridinate.
     * @param latitude The North to South coordinate.
     */
    function Coordinate(longitude, latitude) {
        if (longitude > 180) {
            longitude -= 360;
        }
        this.longitude = longitude;
        this.latitude = latitude;
    }
    /**
     * Get the coordinate as a log/print friendly string.
     * @returns A log/print friendly string of the coordinate.
     */
    Coordinate.prototype.toString = function () {
        return "[lon=" + this.longitude + ", lat=" + this.latitude + "]";
    };
    return Coordinate;
}());
exports.Coordinate = Coordinate;
//# sourceMappingURL=coordinate.js.map