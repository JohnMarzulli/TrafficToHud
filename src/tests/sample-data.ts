import * as fs from 'fs';
import * as path from 'path';
import { Gdl90Message } from '../gdl-messages/gdl90-message'; // Assuming Gdl90Message is in this file
import { decodePayloadFromSample } from '../gdl-messages/uplink'; // Assuming decodePayloadFromSample is in this file

// Corner: 45'8", 123'12" => 45.1333, -123.2
// Corner: 45'4", 122'24" => 45.0667, -122.4
export const faaExampleNexradOregonFirstHalf: string = "130000FC000084A570308950111A53120930110A23451B0A0918090A1B0C1D0607061D041B0A0108208000FC000084A3AE00090A1314150617061D04130A01080112131C0D06270615140B0A01000112131C0D06270615140B0A010000090A1314150617061D04130A0108148000FC000084A1EC00090A1B0C1D0607061D041B0A010808110A23451B0A091018111A53120920308930130000FC000084AAB7308950111A53120930110A23451B0A0918090A1B0C1D0607061D041B0A0108208000FC000084A8F500090A1314150617061D04130A01080112131C0D06270615140B0A01000112131C0D06270615140B0A010000090A1314150617061D04130A0108148000FC000084A73300090A1B0C1D0607061D041B0A010808110A23451B0A091018111A53120920308930130000FC000084AFFD308950111A53120930110A23451B0A0918090A1B0C1D0607061D041B0A0108000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";


export function loadExamples(): void {
    decodePayloadFromSample();

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