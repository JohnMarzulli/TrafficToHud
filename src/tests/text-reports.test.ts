"use strict";

import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { escapeData } from '../data-handling';
import { Gdl90Message } from '../gdl-messages/gdl90-message';
import { FlightRules } from '../weather/flight-rules';
import { TextReports } from '../weather/text-reports';

const badRawReports: string[] = [
    "06 74 08 00 5c fd fd 4e 03 42 5e 0c 35 fd 0c 30 6a 08 06 51 fd 39 fd 0c 1c 0f 1c fd fd 07 07 cc 30 fd fd fd fd 0c 30 70 3c fd fd 0c 1c 13 3d 30 fd 08 20 dc 30 fd fd 5e 71 0c fd d7 04 dc 39 fd 1c 20 fd 7c 72 fd 0e 60 fd 1c 71 fd 2c 60 fd 5c 79 c8 30 fd 2d 74 fd 0c fd fd 1d 74 79 fd 32 00 00 21 39",
    "06 74 07 30 34 55 01 4a 02 fd 48 48 30 fd 0c 75 68 03 3d 28 33 fd 0c 33 2d 48 31 fd 33 60 4c 35 30 fd 68 02 2c fd 70 fd 00 fd 3b 1d fd fd fd fd fd 5c 20 fd 7b fd fd 08 1e 70 50 72 60 48 fd fd 04 fd fd 4c fd 31 d8 03 3c fd fd 31 41 fd 0c 31 fd 11 33 fd fd 31 6d 4d 7b 4e 5e 00 80 44 fd 52 08 1e 70 54 75 35 fd 39 78 0d 3d 68 05 fd 4c 32 fd 2c 32 df 5e 74 41 00 06 74 07 50 34"
];

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
                const deframedBytes: Uint8Array = new Uint8Array(reportText.split(',').map(byteString => parseInt(byteString)));
                const packageAscci: number[] = [0x7E, ...Array.from(escapeData(deframedBytes)), 0x7E];
                const rawMessage = String.fromCharCode(...packageAscci);

                const gdl90Message = new Gdl90Message(rawMessage);
                console.log(gdl90Message.decodedMessage ?? "<NULL>");
            }
        } catch (err) {
            console.error('Error loading or parsing JSON file:', err);
        }
    }
}

function testBadRawReportsAreRejected(): void {
    for (const rawReport of badRawReports) {
        const deframedBytes: Uint8Array = new Uint8Array(rawReport.split(' ').map(byteString => parseInt(byteString)));
        const packageAscci: number[] = [0x7E, ...Array.from(escapeData(deframedBytes)), 0x7E];
        const rawMessage = String.fromCharCode(...packageAscci);

        const gdl90Message = new Gdl90Message(rawMessage);
        console.log(gdl90Message.decodedMessage ?? "<NULL>");

        assert.strictEqual(gdl90Message.decodedMessage, null);
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
testBadRawReportsAreRejected();