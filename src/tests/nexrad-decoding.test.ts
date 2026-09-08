"use strict";

import * as assert from 'assert';
import { UatUplinkFrame } from '../gdl-messages/uplink';
import { Reflectivity, ReflectivityRadar } from '../weather/nexrad';
import * as sampleData from './sample-data';

function getPayloadFromSample(
  faaSample: string
): Uint8Array {
  let payload: Uint8Array = new Uint8Array(faaSample.length / 2);
  for (let i = 0; i < faaSample.length; i += 2) {
    payload[i / 2] = parseInt(faaSample.substr(i, 2), 16);
  }

  return payload;
}

function isAbout(
  actual: number,
  expected: number,
): boolean {
  return Math.abs(actual - expected) < 0.001;
}

function nexradIsDecoded(): void {
  // Corner: 45'8", 123'12" => 45.1333, -123.2
  // Corner: 45'4", 122'24" => 45.0667, -122.4
  const payload = getPayloadFromSample(sampleData.faaExampleNexradOregonFirstHalf);
  const frameLength = (payload[0] << 1) | (payload[1] >> 7);
  const frameType = payload[2] & 0b00000001;
  const graphic = payload.subarray(2, frameLength + 2);

  assert.strictEqual(frameLength, graphic.length, `Frame length mismatch: ${graphic.length} != ${frameLength}`);

  const frameData: Uint8Array = payload.subarray(2, frameLength + 2);
  const decodedFrame = new UatUplinkFrame(0, frameType, frameData);
  assert.notDeepStrictEqual(decodedFrame, null, "Frame was not decoded.");

  const reflectivity: { [key: number]: Reflectivity; } = ReflectivityRadar.getReflectivity(null!);
  assert.notDeepStrictEqual(reflectivity, null, "Reflectivity was not decoded.");

  assert.strictEqual((304496 in reflectivity), true);
  const faaSampleReflectivity = reflectivity[304496];
  assert.strictEqual(faaSampleReflectivity.globalBlockReferenceId, 304496);

  assert.strictEqual(isAbout(faaSampleReflectivity.boundaries.latSize, 0.0166), true);
  assert.strictEqual(isAbout(faaSampleReflectivity.boundaries.lonSize, 0.025), true);

  assert.strictEqual(isAbout(faaSampleReflectivity.boundaries.northWestern.latitude, 45.1333), true);
  assert.strictEqual(isAbout(faaSampleReflectivity.boundaries.northWestern.longitude, -123.199), true);

  assert.strictEqual(isAbout(faaSampleReflectivity.boundaries.southEastern.latitude, 45.066), true);
  assert.strictEqual(isAbout(faaSampleReflectivity.boundaries.southEastern.longitude, -122.3999), true);

  assert.strictEqual(faaSampleReflectivity.reflectivity.length, 4);
  assert.strictEqual(faaSampleReflectivity.reflectivity[0].length, 3);

  assert.strictEqual(faaSampleReflectivity.reflectivity[0][0].runLength, 7);
  assert.strictEqual(faaSampleReflectivity.reflectivity[0][0].reflectivity, 0);

  assert.strictEqual(faaSampleReflectivity.reflectivity[0][1].runLength, 18);
  assert.strictEqual(faaSampleReflectivity.reflectivity[0][1].reflectivity, 1);

  assert.strictEqual(faaSampleReflectivity.reflectivity[0][2].runLength, 7);
  assert.strictEqual(faaSampleReflectivity.reflectivity[0][2].reflectivity, 0);

  console.log("PASSED: NEXRAD decoding tests.");
}


nexradIsDecoded();