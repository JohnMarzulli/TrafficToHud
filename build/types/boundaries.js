"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoordinateBoundaries = void 0;
/**
 * Define the two opposite corners of a block of space.
 */
var CoordinateBoundaries = /** @class */ (function () {
    /**
     * Create a new GPS boundary box.
     * @param northWestern The most NW corner of the box.
     * @param southEastern The most SE corner of the box.
     */
    function CoordinateBoundaries(northWestern, southEastern) {
        this.northWestern = northWestern;
        this.southEastern = southEastern;
    }
    /**
     * Get the coordinate bounds as text.
     * @returns
     */
    CoordinateBoundaries.prototype.toString = function () {
        return "[northWestern=" + this.northWestern + ", southEastern=" + this.southEastern + "]";
    };
    return CoordinateBoundaries;
}());
exports.CoordinateBoundaries = CoordinateBoundaries;
//# sourceMappingURL=boundaries.js.map