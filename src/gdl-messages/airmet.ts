function dlacDecode(data: Uint8Array): string {
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

export function decodeAirmet(
    data: Uint8Array
) {
    const record_format: number = ((data[0]) & 0xF0) >> 4;
    const product_version: number = ((data[0]) & 0x0F);
    const record_count: number = ((data[1]) & 0xF0) >> 4;
    const location_identifier: string = dlacDecode(data.subarray(2, 5));
    const record_reference: number = ((data[5])); //FIXME: Special values. 0x00 means "use location_identifier". 0xFF means "use different reference". (4-3).

    if (record_format == 2) {
        const record_length: number = ((data[6]) << 8) | (data[7]);
        if ((data.length - record_length) < 6) {
            console.error(`FISB record not long enough: record_length=${record_length}, data.length=${data.length}`);
            return;
        }
        // Report identifier = report number + report year.
        const report_number: number = ((data[8]) << 6) | (((data[9]) & 0xFC) >> 2);
        const report_year: number = (((data[9]) & 0x03) << 5) | (((data[10]) & 0xF8) >> 3);
        const report_status: number = ((data[10]) & 0x04) >> 2; //TODO: 0 = cancelled, 1 = active.
        const text_data_len: number = record_length - 5;
        const text_data: string = dlacDecode(data.subarray(11, 11 + text_data_len - 1));

        console.log(`    AIRMET: record_format=${record_format}, product_version=${product_version}, record_count=${record_count}, location_identifier=${location_identifier}, record_reference=${record_reference}, record_length=${record_length}, report_number=${report_number}, report_year=${report_year}, report_status=${report_status}, text_data_len=${text_data_len}, text_data=${text_data}`);
    }

    console.log(`    AIRMET: record_format=${record_format}, product_version=${product_version}, record_count=${record_count}, location_identifier=${location_identifier}, record_reference=${record_reference}`);
}