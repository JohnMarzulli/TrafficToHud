import { Gdl90Message } from './gdl90-message'; // Assuming Gdl90Message is in this file
import { decodePayloadFromSample } from './uplink'; // Assuming decodePayloadFromSample is in this file
import * as fs from 'fs';
import * as path from 'path';

// Main execution
(async function main() {
    decodePayloadFromSample();

    const filePath = path.resolve(__dirname, '../../documentation/full-nexrad.json'); // Adjust path as needed

    try {
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
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
})();
