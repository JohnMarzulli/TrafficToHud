"use strict";

import * as assert from 'assert';

const unknown: string = "Unknown";

/**
 * List of flight rule categories
 */
export enum FlightRules {
    /**
     * Unable to decode the flight rules
     */
    unknown = "UNK",
    /**
     * Visual Flight Rules
     */
    vfr = "VFR",
    /**
     * Marginal Visual Flight Rules
     */
    mvfr = "mvfr",
    /**
     * Instrument Flight Rules
     */
    ifr = "ifr",
    /**
     * Low Instrument Flight Rules
     */
    lifr = "lifr"
}

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
 * Add a report to the current known metars.
 * @param report The report to add.
 */
export function addReport(report: Metar): void {
    metars[report.station] = report;

    // TODO: Prune these reports based on age.
}

/**
 * Get any reports for the given station/
 * @param station The station to get the metar for.
 * @returns The report, if any were found. Otherwise returns `null`.
 */
export function getReport(station: string): Metar | null {
    try {
        return metars[station.trim().toUpperCase()];
    }
    catch {
        return null;
    }
}

const metars: { [key: string]: Metar; } = {};

function getFlightRules(
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

function getStation(
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

function getVisibilityCategory(
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

function getCeilingCategory(
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

function runVisbilityTests() {
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.vfr);
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 4SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.mvfr);
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 3SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.mvfr);
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 2 1/2SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 2SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 1SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 1/2SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.lifr);
    assert.strictEqual(getVisibilityCategory('KGCC 231853Z AUTO 28011KT 20/12 A2991 RMK AO2 LTG DSNT SE RAB41RAEMM SLP085 P0000 T02000117 PWINO $'), FlightRules.vfr);
    assert.strictEqual(getVisibilityCategory('KVOK 251453Z 34004KT 10SM SCT008 OVC019 21/21 A2988 RMK AO2A SCT V BKN SLP119 53012'), FlightRules.vfr);

    console.log("PASSED: Visbility categorization tests");
}

function runCeilingTests() {
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.vfr);
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 4SM SCT041 OVC030 23/14 A3001 RMK AO2 SLP165'), FlightRules.vfr);
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 3SM SCT041 BKN025 23/14 A3001 RMK AO2 SLP165'), FlightRules.mvfr);
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 2 1/2SM SCT041 BKN009 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 2 1/2SM SCT041 OVC009 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 2SM OVC004 23/14 A3001 RMK AO2 SLP165'), FlightRules.lifr);
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 2SM SCT010 OVC004 23/14 A3001 RMK AO2 SLP165'), FlightRules.lifr);
    assert.strictEqual(getCeilingCategory('KGCC 231853Z AUTO 28011KT 20/12 A2991 RMK AO2 LTG DSNT SE RAB41RAEMM SLP085 P0000 T02000117 PWINO $'), FlightRules.vfr);
    assert.strictEqual(getCeilingCategory('KVOK 251453Z 34004KT 10SM SCT008 OVC019 21/21 A2988 RMK AO2A SCT V BKN SLP119 53012'), FlightRules.mvfr);

    console.log("PASSED: Ceiling categorization tests");
}

function runStationTests() {
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 4SM SCT041 OVC030 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 3SM SCT041 BKN025 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 2 1/2SM SCT041 BKN009 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 2 1/2SM SCT041 OVC009 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 2SM OVC004 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 2SM SCT010 OVC004 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KGCC 231853Z AUTO 28011KT 20/12 A2991 RMK AO2 LTG DSNT SE RAB41RAEMM SLP085 P0000 T02000117 PWINO $'), 'KGCC');
    assert.strictEqual(getStation('KVOK 251453Z 34004KT 10SM SCT008 OVC019 21/21 A2988 RMK AO2A SCT V BKN SLP119 53012'), 'KVOK');

    console.log("PASSED: Station extraction tests");
}

function runCategoryTests() {
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.vfr);
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 4SM SCT041 OVC030 23/14 A3001 RMK AO2 SLP165'), FlightRules.mvfr);
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 3SM SCT041 BKN025 23/14 A3001 RMK AO2 SLP165'), FlightRules.mvfr);
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 2 1/2SM SCT041 BKN009 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 2 1/2SM SCT041 OVC009 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 2SM OVC004 23/14 A3001 RMK AO2 SLP165'), FlightRules.lifr);
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 2SM SCT010 OVC004 23/14 A3001 RMK AO2 SLP165'), FlightRules.lifr);
    assert.strictEqual(getFlightRules('KGCC 231853Z AUTO 28011KT 20/12 A2991 RMK AO2 LTG DSNT SE RAB41RAEMM SLP085 P0000 T02000117 PWINO $'), FlightRules.vfr);
    assert.strictEqual(getFlightRules('KVOK 251453Z 34004KT 10SM SCT008 OVC019 21/21 A2988 RMK AO2A SCT V BKN SLP119 53012'), FlightRules.mvfr);

    console.log("PASSED: Flight rules categorization tests");
}

function runAddReportTests() {
    const initialReport: string = 'KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165';
    addReport(new Metar(initialReport));

    const idents: string[] = ['KRNT', 'Krnt', 'krnt'];

    for (const ident of idents) {
        const foundReport: Metar = getReport(ident);
        assert.strictEqual(foundReport.metar, initialReport);
    }

    console.log("PASSED: Report adding & fetching tests");
}

runVisbilityTests();
runCeilingTests();
runStationTests();
runCategoryTests();
runAddReportTests();