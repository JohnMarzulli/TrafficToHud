"use strict";

import * as assert from 'assert';

/**
 * Decode a piece of DLAC data per the ADS-B specification
 * @param data The data to decode.
 * @returns The decoded text.
 */
export function dlacDecode(data: Uint8Array): string {
    const dlacAlpha: string = "\x03ABCDEFGHIJKLMNOPQRSTUVWXYZ\x1A\t\x1E\n| !\"#$%&'()*+,-./0123456789:;<=>?";

    let step: number = 0;
    let tab: boolean = false;
    let ret: string = "";

    for (let i: number = 0; i < data.length; i++) {
        let ch: number;

        switch (step) {
            case 0:
                ch = data[i + 0] >> 2;

                break;
            case 1:
                ch = (((data[i - 1]) & 0x03) << 4) | ((data[i + 0]) >> 4);

                break;
            case 2:
                ch = (((data[i - 1]) & 0x0f) << 2) | ((data[i + 0]) >> 6);
                --i;

                break;
            case 3:
                ch = (data[i + 0]) & 0x3f;

                break;
        }

        if (tab) {
            while (ch > 0) {
                ret += " ";
                ch--;
            }
            tab = false;
        } else if (ch == 28) { // tab
            tab = true;
        } else {
            ret += dlacAlpha[ch];
        }
        step = (step + 1) % 4;
    }

    return ret;
}

/**
 * Decode a GENERIC text weather product.
 * @param data The DLAC encoded generic text product.
 * @returns Human readable text.
 */
export function decodeGenericText(
    data: Uint8Array
): string {
    const textData: string = dlacDecode(data);

    console.log(`    GENERIC TEXT: textData=${textData}`);

    return textData;
}

/**
 * Decode an AIRMET from DLAC encoding.
 * @param data The DLAC encoded data
 * @returns A human readable AIRMET
 */
export function decodeAirmet(
    data: Uint8Array
): string | null {
    const recordFormat: number = ((data[0]) & 0xF0) >> 4;
    const productVersion: number = ((data[0]) & 0x0F);
    const recordCount: number = ((data[1]) & 0xF0) >> 4;
    const locationIdentifier: string = dlacDecode(data.subarray(2, 5));
    const recordReference: number = ((data[5])); //FIXME: Special values. 0x00 means "use location_identifier". 0xFF means "use different reference". (4-3).

    if (recordFormat == 2) {
        const recordLength: number = ((data[6]) << 8) | (data[7]);
        if ((data.length - recordLength) < 6) {
            console.error(`FISB record not long enough: recordLength=${recordLength}, data.length=${data.length}`);

            return;
        }
        // Report identifier = report number + report year.
        const reportNumber: number = ((data[8]) << 6) | (((data[9]) & 0xFC) >> 2);
        const reportYear: number = (((data[9]) & 0x03) << 5) | (((data[10]) & 0xF8) >> 3);
        const reportStatus: number = ((data[10]) & 0x04) >> 2; //TODO: 0 = cancelled, 1 = active.
        const textDataLength: number = recordLength - 5;
        const textData: string = dlacDecode(data.subarray(11, 11 + textDataLength - 1));

        console.log(`    AIRMET: recordFormat=${recordFormat}, productVersion=${productVersion}, recordCount=${recordCount}, locationIdentifier=${locationIdentifier}, recordReference=${recordReference}, recordLength=${recordLength}, reportNumber=${reportNumber}, reportYear=${reportYear}, reportStatus=${reportStatus}, textDataLength=${textDataLength}, textData=${textData}`);

        return textData;
    }
    else {
        console.error(`Unknown format=${recordFormat}`);
    }

    console.log(`    AIRMET: recordFormat=${recordFormat}, productVersion=${productVersion}, recordCount=${recordCount}, locationIdentifier=${locationIdentifier}, recordReference=${recordReference}`);

    return null;
}

function testDecodeAirmet() {
    assert.strictEqual(
        decodeAirmet(new Uint8Array([34, 16, 0, 0, 0, 255, 1, 1, 172, 100, 204, 4, 148, 141, 21, 72, 11, 76, 99, 224, 195, 28, 52, 199, 72, 19, 24, 244, 224, 92, 24, 48, 199, 13, 49, 206, 0, 77, 17, 224, 73, 72, 209, 84, 129, 50, 69, 73, 32, 96, 85, 1, 20, 131, 24, 6, 61, 40, 9, 25, 40, 1, 56, 72, 13, 80, 232, 15, 9, 48, 206, 129, 96, 76, 36, 72, 21, 57, 66, 76, 131, 12, 112, 231, 12, 30, 4, 148, 141, 21, 72, 13, 80, 232, 15, 9, 48, 206, 186, 235, 151, 6, 3, 210, 128, 48, 94, 25, 35, 205, 131, 140, 23, 77, 120, 25, 96, 56, 20, 62, 12, 176, 93, 53, 224, 16, 226, 160, 80, 248, 50, 193, 49, 96, 72, 83, 224, 80, 248, 53, 193, 52, 197, 128, 194, 214, 129, 67, 224, 219, 1, 96, 72, 35, 30, 80, 248, 18, 8, 200, 20, 62, 12, 240, 20, 225, 96, 20, 226, 96, 80, 248, 51, 193, 53, 224, 20, 226, 96, 80, 248, 50, 193, 52, 215, 128, 99, 212, 129, 67, 224, 60, 228, 32, 80, 248, 8, 68, 216, 20, 61, 229, 15, 86, 5, 15, 128, 133, 72, 129, 67, 224, 227, 5, 211, 94, 6, 88, 13, 227, 84, 57, 56, 15, 9, 48, 224, 9, 152, 3, 48, 68, 239, 64, 52, 14, 188, 36, 174, 128, 51, 206, 17, 56, 3, 60, 229, 7, 128, 38, 68, 131, 14, 90, 129, 66, 18, 86, 12, 117, 106, 231, 128])),
        "AIRMET KSFO 010414 SFOS WA 010413 AMD\nAIRMET SIERRA UPDT 1 FOR IFR AND MTN OBSCN VALID UNTIL 010900\nAIRMET MTN OBSCN...WA OR CA\nFROM 80WSW YXC TO 20WSW DNJ TO 20SE REO TO 50SSE LKV TO 60E RBL\nTO RBL TO 30ENE ENI TO 30SW ENI TO 20SSW FOT TO ONP TO HQM TO\nTOU TO HUH TO 80WSW YXC\nMTNS OBSC BY CLDS/PCPN/BR. CONDS CONTG BYD 09Z THRU 15Z.");

    console.log("Airmet tests passed!");
}

function testDecodeGenericText() {
    assert.strictEqual(
        decodeGenericText(new Uint8Array([52, 85, 1, 74, 2, 208, 49, 88, 48, 199, 13, 117, 213, 168, 1, 85, 67, 224, 195, 12, 48, 192, 181, 32, 199, 4, 205, 131, 13, 47, 195, 72, 1, 207, 12, 50, 129, 35, 75, 128, 19, 242, 245, 231, 64])),
        "METAR KPLU 010555Z AUTO 00000KT 10SM 04/04 A3002 RMK AO2=\n\u001e\u0003");
    assert.strictEqual(
        decodeGenericText(new Uint8Array([52, 85, 1, 74, 2, 244, 79, 40, 48, 199, 13, 117, 213, 168, 1, 85, 67, 224, 195, 12, 48, 192, 181, 32, 213, 51, 96, 72, 24, 19, 13, 76, 48, 218, 3, 214, 15, 12, 119, 131, 12, 111, 195, 24, 1, 207, 12, 113, 129, 35, 75, 130, 7, 156, 24, 19, 242, 245, 231, 64])),
        "METAR K4S2 010555Z AUTO 00000KT 5SM RA SCT006 OVC017 01/01 A3011 RMK  \n      AO2=\n\u001e\u0003");

    console.log("Text product decoding tests passed!");
}

testDecodeAirmet();
testDecodeGenericText();