"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var uplink_1 = require("../gdl-messages/uplink");
var nexrad_1 = require("../weather/nexrad");
var sampleData = require("./sample-data");
function getPayloadFromSample(faaSample) {
    var payload = new Uint8Array(faaSample.length / 2);
    for (var i = 0; i < faaSample.length; i += 2) {
        payload[i / 2] = parseInt(faaSample.substr(i, 2), 16);
    }
    return payload;
}
function isAbout(actual, expected) {
    return Math.abs(actual - expected) < 0.001;
}
function nexradIsDecoded() {
    // Corner: 45'8", 123'12" => 45.1333, -123.2
    // Corner: 45'4", 122'24" => 45.0667, -122.4
    var payload = getPayloadFromSample(sampleData.faaExampleNexradOregonFirstHalf);
    var frameLength = (payload[0] << 1) | (payload[1] >> 7);
    var frameType = payload[2] & 1;
    var graphic = payload.subarray(2, frameLength + 2);
    assert(graphic.length === frameLength, "Frame length mismatch: " + graphic.length + " != " + frameLength);
    var frameData = payload.subarray(2, frameLength + 2);
    var decodedFrame = new uplink_1.UatUplinkFrame(0, frameType, frameData);
    assert(decodedFrame !== null, "Frame was not decoded.");
    var reflectivity = nexrad_1.ReflectivityRadar.getReflectivity(null);
    assert(reflectivity !== null, "Reflectivity was not decoded.");
    assert(304496 in reflectivity);
    var faaSampleReflectivity = reflectivity[304496];
    assert(faaSampleReflectivity.globalBlockReferenceId === 304496);
    assert(isAbout(faaSampleReflectivity.boundaries.latSize, 0.0166));
    assert(isAbout(faaSampleReflectivity.boundaries.lonSize, 0.025));
    assert(isAbout(faaSampleReflectivity.boundaries.northWestern.latitude, 45.1333));
    assert(isAbout(faaSampleReflectivity.boundaries.northWestern.longitude, -123.199));
    assert(isAbout(faaSampleReflectivity.boundaries.southEastern.latitude, 45.066));
    assert(isAbout(faaSampleReflectivity.boundaries.southEastern.longitude, -122.3999));
    assert(faaSampleReflectivity.reflectivity.length === 4);
    assert(faaSampleReflectivity.reflectivity[0].length === 3);
    assert(faaSampleReflectivity.reflectivity[0][0].runLength === 7);
    assert(faaSampleReflectivity.reflectivity[0][0].reflectivity === 0);
    assert(faaSampleReflectivity.reflectivity[0][1].runLength === 18);
    assert(faaSampleReflectivity.reflectivity[0][1].reflectivity === 1);
    assert(faaSampleReflectivity.reflectivity[0][2].runLength === 7);
    assert(faaSampleReflectivity.reflectivity[0][2].reflectivity === 0);
    console.log("PASSED: NEXRAD decoding tests.");
}
nexradIsDecoded();
//# sourceMappingURL=nexrad-decoding.test.js.map