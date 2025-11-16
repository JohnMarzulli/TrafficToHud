"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadExamples = void 0;
var fs = require("fs");
var path = require("path");
var gdl90_message_1 = require("../gdl-messages/gdl90-message"); // Assuming Gdl90Message is in this file
var uplink_1 = require("../gdl-messages/uplink"); // Assuming decodePayloadFromSample is in this file
function loadExamples() {
    uplink_1.decodePayloadFromSample();
    var exampleFiles = [
        '../../documentation/full-nexrad.json',
        '../../documentation/full-asa379.json',
        '../../documentation/full-lots-nexrad.json',
        '../../documentation/full-medley.json',
        '../../documentation/full-more-nexrad.json',
        '../../documentation/full-notams.json'
    ];
    for (var _i = 0, exampleFiles_1 = exampleFiles; _i < exampleFiles_1.length; _i++) {
        var exampleFile = exampleFiles_1[_i];
        var filePath = path.resolve(__dirname, exampleFile);
        try {
            var fileContent = fs.readFileSync(filePath, 'utf-8');
            var rawMessages = JSON.parse(fileContent);
            var uat7Reports = rawMessages["last_msg"]["7"];
            for (var _a = 0, uat7Reports_1 = uat7Reports; _a < uat7Reports_1.length; _a++) {
                var reportPackage = uat7Reports_1[_a];
                var reportText = reportPackage["report"];
                var byteStrings = ("126," + reportText + ",126").split(',');
                var packageAscci = byteStrings.map(function (byteString) { return parseInt(byteString); });
                var rawMessage = String.fromCharCode.apply(String, packageAscci);
                var gdl90Message = new gdl90_message_1.Gdl90Message(rawMessage);
                console.log(gdl90Message.decodedMessage);
            }
        }
        catch (err) {
            console.error('Error loading or parsing JSON file:', err);
        }
    }
}
exports.loadExamples = loadExamples;
//# sourceMappingURL=sample_data.js.map