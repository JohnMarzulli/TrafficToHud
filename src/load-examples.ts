import * as fs from 'fs';
import * as path from 'path';
import { escapeData } from './data-handling';
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

// Main execution
(async function main() {
    loadExamples();
})();