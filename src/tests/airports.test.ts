"use strict";

import * as assert from 'assert';
import { getAirportsFrequenciesWithinDistance, getAirportsWithinDistance, loadAirports, loadFrequencies } from '../locations/airports';
import { Airport } from '../types/airport';
import { AirportFrequencies } from '../types/airportFrequencies';
import { Coordinate } from '../types/coordinate';

function hasAirport(
    airports: Airport[],
    ident: string
) {
    return airports.filter(airport => { return airport.ident === ident; }).length >= 1;
}

function hasAirportFrequencies(
    airportFrequencies: { [key: string]: AirportFrequencies[]; },
    ident: string
) {
    const hasIdent = ident in airportFrequencies;

    return hasIdent
        && airportFrequencies[ident].length > 0;
}

function testGetAirportsByDistance() {
    loadAirports();

    const foundAirports: Airport[] = getAirportsWithinDistance(
        new Coordinate(-122.15, 48.16),
        20.0);

    assert.strictEqual(foundAirports.length, 12);

    assert.strictEqual(hasAirport(foundAirports, "KAWO"), true);
    assert.strictEqual(hasAirport(foundAirports, "KPAE"), true);
    assert.strictEqual(hasAirport(foundAirports, "W10"), true);
    assert.strictEqual(hasAirport(foundAirports, "S43"), true);
    assert.strictEqual(hasAirport(foundAirports, "W10"), true);

    assert.strictEqual(hasAirport(foundAirports, "SEA"), false);
    assert.strictEqual(hasAirport(foundAirports, "BVS"), false);

    console.log("PASSED: Airport search tests.");
}

function testGetAirportFrequenciesByDistance() {
    loadFrequencies();

    const foundFrequencies: { [key: string]: AirportFrequencies[]; } = getAirportsFrequenciesWithinDistance(
        new Coordinate(-122.15, 48.16),
        20.0);

    assert.strictEqual(Object.keys(foundFrequencies).length, 8);

    assert.strictEqual(hasAirportFrequencies(foundFrequencies, "AWO"), true);
    assert.strictEqual(foundFrequencies["AWO"].length, 2);
    assert.strictEqual(hasAirportFrequencies(foundFrequencies, "PAE"), true);
    assert.strictEqual(foundFrequencies["PAE"].length, 10);
    assert.strictEqual(hasAirportFrequencies(foundFrequencies, "W10"), true);
    assert.strictEqual(hasAirportFrequencies(foundFrequencies, "S43"), true);
    assert.strictEqual(hasAirportFrequencies(foundFrequencies, "W10"), true);

    assert.strictEqual(hasAirportFrequencies(foundFrequencies, "SEA"), false);
    assert.strictEqual(hasAirportFrequencies(foundFrequencies, "BVS"), false);

    console.log("PASSED: Airport Frequency search tests.");
}

testGetAirportFrequenciesByDistance();
testGetAirportsByDistance();