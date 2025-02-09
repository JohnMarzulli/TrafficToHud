"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Airport = void 0;
/**
 * Information about an airport based on the FAA
 * published data.
 */
var Airport = /** @class */ (function () {
    function Airport(coordinates, ident, name, type, isPublic) {
        this.coordinates = coordinates;
        this.ident = ident;
        this.name = name;
        this.airportType = type;
        this.isPublic = isPublic;
    }
    return Airport;
}());
exports.Airport = Airport;
//# sourceMappingURL=airport.js.map