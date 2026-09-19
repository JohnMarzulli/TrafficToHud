"use strict";

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
        let ch: number = 0;

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
    return dlacDecode(data);
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

    /*
    const productVersion: number = ((data[0]) & 0x0F);
    const recordCount: number = ((data[1]) & 0xF0) >> 4;
    const locationIdentifier: string = dlacDecode(data.subarray(2, 5));
    const recordReference: number = ((data[5])); //FIXME: Special values. 0x00 means "use location_identifier". 0xFF means "use different reference". (4-3).
    */

    if (recordFormat == 2) {
        const recordLength: number = ((data[6]) << 8) | (data[7]);
        if ((data.length - recordLength) < 6) {
            console.error(`FISB record not long enough: recordLength=${recordLength}, data.length=${data.length}`);

            return null;
        }
        // Report identifier = report number + report year.
        /*
        const reportNumber: number = ((data[8]) << 6) | (((data[9]) & 0xFC) >> 2);
        const reportYear: number = (((data[9]) & 0x03) << 5) | (((data[10]) & 0xF8) >> 3);
        const reportStatus: number = ((data[10]) & 0x04) >> 2; //TODO: 0 = cancelled, 1 = active.
        */
        const textDataLength: number = recordLength - 5;
        const textData: string = dlacDecode(data.subarray(11, 11 + textDataLength - 1));

        return textData;
    }
    else {
        console.error(`Unknown format=${recordFormat}`);
    }

    return null;
}