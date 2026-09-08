"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirportFrequencies = void 0;
var coordinate_1 = require("./coordinate");
/**
 * Holds information about frequencies as published by the FAA
 */
var AirportFrequencies = /** @class */ (function () {
    function AirportFrequencies(tokens) {
        var lat = parseFloat(tokens[10]);
        var lon = parseFloat(tokens[11]);
        this.coordinates = new coordinate_1.Coordinate(lon, lat);
        this.facilityId = this.cleanString(tokens[1]);
        this.facilityName = this.cleanString(tokens[2]);
        this.facilityType = this.cleanString(tokens[3]);
        this.artcOrFssId = this.cleanString(tokens[4]);
        this.serviceSiteType = this.cleanString(tokens[9]);
        this.towerOrComFreq = this.cleanString(tokens[15]);
        this.approachFreq = this.cleanString(tokens[16]);
        this.frequency = this.cleanString(tokens[17]);
        /*
        LCL/P local control tower / primary
        LCL/S local control tower / secondary
        GND/P ground / primary
        GND/S ground / secondary
        CD/P clearance delivery / primary
        */
        this.frequencyName = this.cleanString(tokens[19]);
        this.remarks = this.cleanString(tokens[20]);
    }
    AirportFrequencies.prototype.cleanString = function (token) {
        if (!token) {
            return '';
        }
        return token.replace(/['"]/g, '');
    };
    return AirportFrequencies;
}());
exports.AirportFrequencies = AirportFrequencies;
//# sourceMappingURL=airportFrequencies.js.map