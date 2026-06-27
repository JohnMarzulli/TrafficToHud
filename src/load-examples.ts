import * as fs from 'fs';
import * as path from 'path';
import { Gdl90Message } from './gdl-messages/gdl90-message'; // Assuming Gdl90Message is in this file
import { decodePayloadFromSample } from './gdl-messages/uplink'; // Assuming decodePayloadFromSample is in this file

function loadExamples(): void {
    decodePayloadFromSample();

    const exampleFiles: string[] = [
        '../documentation/full-nexrad.json',
        '../documentation/full-asa379.json',
        '../documentation/full-lots-nexrad.json',
        '../documentation/full-medley.json',
        '../documentation/full-more-nexrad.json',
        '../documentation/full-notams.json'
    ];

    for (const exampleFile of exampleFiles) {

        const filePath = path.resolve(__dirname, exampleFile);

        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const rawMessages = JSON.parse(fileContent);

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

// Main execution
(async function main() {
    loadExamples();
})();
