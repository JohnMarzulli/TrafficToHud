"use strict";

import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { Gdl90Message } from '../gdl-messages/gdl90-message';
import { FlightRules } from '../weather/flight-rules';
import { TextReports } from '../weather/text-reports';

function loadExamples(): void {
    const exampleFiles: string[] = [
        '../../documentation/full-nexrad.json',
        '../../documentation/full-asa379.json',
        '../../documentation/full-lots-nexrad.json',
        '../../documentation/full-medley.json',
        '../../documentation/full-more-nexrad.json',
        '../../documentation/full-notams.json'
    ];

    for (const exampleFile of exampleFiles) {

        const filePath = path.resolve(__dirname, exampleFile);

        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const rawMessages: string[] = JSON.parse(fileContent);

            const uat7Reports = rawMessages["last_msg"]["7"];

            for (const reportPackage of uat7Reports) {
                const reportText: string = reportPackage["report"];
                const byteStrings: string[] = `126,${reportText},126`.split(',');
                const packageAscci: number[] = byteStrings.map(byteString => parseInt(byteString));
                const rawMessage = String.fromCharCode(...packageAscci);

                const gdl90Message = new Gdl90Message(rawMessage);
                console.log(gdl90Message.decodedMessage);
            }
        } catch (err) {
            console.error('Error loading or parsing JSON file:', err);
        }
    }
}

function testGetFlightRules(): void {
    loadExamples();

    const knownFlightRules: { [key in string]: FlightRules } = TextReports.getKnownFlightRules(null);

    assert.strictEqual(true, knownFlightRules !== null);

    assert.strictEqual(FlightRules.vfr, knownFlightRules["K0S9"]);
    assert.strictEqual(FlightRules.mvfr, knownFlightRules["K4S2"]);
    assert.strictEqual(FlightRules.mvfr, knownFlightRules["K63S"]);
    assert.strictEqual(FlightRules.ifr, knownFlightRules["K6S2"]);
    assert.strictEqual(FlightRules.vfr, knownFlightRules["KBVS"]);
    assert.strictEqual(FlightRules.vfr, knownFlightRules["KPLU"]);
    assert.strictEqual(FlightRules.vfr, knownFlightRules["KS33"]);
    assert.strictEqual(FlightRules.vfr, knownFlightRules["KS39"]);
    assert.strictEqual(FlightRules.vfr, knownFlightRules["KSZT"]);

    console.log("PASSED: Flight rules categorization tests");
}

testGetFlightRules();