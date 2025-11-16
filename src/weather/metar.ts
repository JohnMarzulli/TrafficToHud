"use strict";

import { FlightRules } from './flight-rules';

const unknown: string = "Unknown";

/**
 * Object to hold and decode a weather report.
 */
export class Metar {
    /**
     * What are the flight rules based on the METAR?
     *
     * @type {FlightRules}
     * @memberof Metar
     */
    public readonly flightRules: FlightRules;

    /**
     * Which station issued the METAR?
     *
     * @type {string}
     * @memberof Metar
     */
    public readonly station: string;

    /**
     * The raw METAR
     *
     * @type {string}
     * @memberof Metar
     */
    public readonly metar: string;

    public constructor(
        report: string
    ) {
        this.metar = report.trim();
        this.station = getStation(this.metar);
        this.flightRules = getFlightRules(this.metar);
        // TODO: Add a report time so we can prune this.
    }
}

/**
 * For a METAR, what is the flight category of the VISBILITY
 * @param metar The METAR to analyze for visbility
 * @returns The flight category based on *only* the visibility
 */
export function getVisibilityCategory(
    metar: string
): FlightRules {
    const visbilityText: string | null = getVisibility(metar)?.toUpperCase()?.replace("SM", "");

    if (visbilityText == null) {
        return FlightRules.vfr;
    }

    let distance: number = 0;

    if (visbilityText.includes('/')) {
        const wholeAndFraction: string[] = visbilityText.split(' ');
        const fractionIndex = wholeAndFraction.length == 2 ? 1 : 0;
        const fraction = wholeAndFraction[fractionIndex].split('/');

        const wholeNumber: number = wholeAndFraction.length == 2 ? parseInt(wholeAndFraction[0], 10) : 0;

        distance = wholeNumber + (parseInt(fraction[0]) / parseInt(fraction[1]));
    } else {
        distance = parseInt(visbilityText, 10);
    }

    if (distance < 1) {
        return FlightRules.lifr;
    }

    if (distance < 3) {
        return FlightRules.ifr;
    }

    if (distance <= 5) {
        return FlightRules.mvfr;
    }

    return FlightRules.vfr;
}

/**
 * For a METAR, what is the flight category of the CEILING
 * @param metar The METAR to analyze for the ceiling
 * @returns The flight category based on *only* the ceiling
 */

export function getCeilingCategory(
    metar: string
): FlightRules {
    const ceiling: number = getCeiling(metar);

    if (ceiling <= 500) {
        return FlightRules.lifr;
    } else if (ceiling <= 1000) {
        return FlightRules.ifr;
    } else if (ceiling < 3000) {
        return FlightRules.mvfr;
    }

    return FlightRules.vfr;
}

/**
 * Get the station that reported the METAR
 * @param metar The metar to extract the reporting station from.
 * @returns The station found, otherwise "UNKNOWN".
 */
export function getStation(
    metar: string
): string {
    if (metar.length < 3) {
        return unknown;
    }

    try {
        const tokens: string[] = metar.split(' ');

        if (tokens.length < 1) {
            return unknown;
        }

        const station: string = tokens[0].trim();

        if (station.length < 2 || station.length > 8) {
            return unknown;
        }

        return station;
    }
    catch {
        return unknown;
    }
}

/**
 * Given a METAR, what are the flight rules for the weather?
 * @param metar The METAR to extract the flight rules from.
 * @returns The flight rules for the station based on the METAR.
 */
export function getFlightRules(
    metar: string
): FlightRules {
    const vis = getVisibilityCategory(metar);
    const ceiling = getCeilingCategory(metar);
    let flightRules: FlightRules = FlightRules.unknown;

    if (ceiling == FlightRules.unknown || vis == FlightRules.unknown) {
        flightRules = FlightRules.unknown;
    } else if (vis == FlightRules.lifr || ceiling == FlightRules.lifr) {
        flightRules = FlightRules.lifr;
    } else if (vis == FlightRules.ifr || ceiling == FlightRules.ifr) {
        flightRules = FlightRules.ifr;
    } else if (vis == FlightRules.mvfr || ceiling == FlightRules.mvfr) {
        flightRules = FlightRules.mvfr;
    } else if (vis == FlightRules.vfr && ceiling == FlightRules.vfr) {
        flightRules = FlightRules.vfr;
    }

    return flightRules;
}

function getVisibility(
    metar: string
): string | null {
    /**
     * Extracts the visibility value from a RAW METAR.
     *
     * @param metar - The RAW weather report in METAR format.
     * @returns The visibility value as a string, or null if not found.
     */
    const visRegEx = /\b(\d+\s\d\/\d|\d+\/\d|\d+)SM\b/; // /(\d+\s\d+\/\d+SM|\d+SM)/

    const match = metar.match(visRegEx);

    return match ? match[0].trim() : null;
}

function getCeiling(
    metar: string
): number {
    // Exclude the remarks from being parsed as the current
    // condition as they normally are for events that
    // are in the past.
    const components: string[] = getMainMetarComponents(metar);
    let minimumCeiling: number = 10000;

    for (let component of components) {
        if (component.toLocaleUpperCase().includes('BKN')
            || component.toLocaleUpperCase().includes('OVC')) {
            try {
                const ceiling: number = parseInt(component.replace(/\D/g, ""), 10) * 100;

                if (ceiling < minimumCeiling) {
                    minimumCeiling = ceiling;
                }
            }
            catch { }
        }
    }

    return minimumCeiling;
}

function getMainMetarComponents(
    metar: string
): string[] | null {
    return metar.toUpperCase().split("RMK")[0].split(" ").slice(1);
}