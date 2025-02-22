"use strict";

import * as assert from 'assert';
import { getAirportsWithinDistance, loadAirports } from '../locations/airports';
import { Airport } from '../types/airport';
import { Coordinate } from '../types/coordinate';

function hasAirport(
    airports: Airport[],
    ident: string
) {
    return airports.filter(airport => { return airport.ident === ident; }).length >= 1;
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

testGetAirportsByDistance();