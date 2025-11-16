"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightRules = void 0;
/**
 * List of flight rule categories
 */
var FlightRules;
(function (FlightRules) {
    /**
     * Unable to decode the flight rules
     */
    FlightRules["unknown"] = "UNK";
    /**
     * Visual Flight Rules
     */
    FlightRules["vfr"] = "VFR";
    /**
     * Marginal Visual Flight Rules
     */
    FlightRules["mvfr"] = "MVFR";
    /**
     * Instrument Flight Rules
     */
    FlightRules["ifr"] = "IFR";
    /**
     * Low Instrument Flight Rules
     */
    FlightRules["lifr"] = "LIFR";
})(FlightRules = exports.FlightRules || (exports.FlightRules = {}));
//# sourceMappingURL=flight-rules.js.map