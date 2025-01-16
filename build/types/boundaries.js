"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoordinateBoundaries = void 0;
var CoordinateBoundaries = /** @class */ (function () {
    function CoordinateBoundaries(northWestern, southEastern) {
        this.northWestern = northWestern;
        this.southEastern = southEastern;
    }
    CoordinateBoundaries.prototype.toString = function () {
        return "[northWestern=" + this.northWestern + ", southEastern=" + this.southEastern + "]";
    };
    return CoordinateBoundaries;
}());
exports.CoordinateBoundaries = CoordinateBoundaries;
//# sourceMappingURL=boundaries.js.map