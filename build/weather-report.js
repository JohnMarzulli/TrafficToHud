"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGdl90Weather = void 0;
function parseWeatherData(payload) {
    // This function should parse the weather data based on GDL90 specification
    // For example purposes, let's assume we have a fixed structure:
    if (payload.length < 8) {
        return null;
    }
    var temperature = payload[0];
    var windSpeed = payload[1];
    var windDirection = (payload[2] << 8) | payload[3];
    var weatherReport = {
        temperature: temperature,
        windSpeed: windSpeed,
        windDirection: windDirection,
    };
    return weatherReport;
}
function parseWeatherRadarData(payload) {
    if (payload.length < 12) {
        return null;
    }
    var latitude = ((payload[0] << 8) | payload[1]) / 3600;
    var longitude = ((payload[2] << 8) | payload[3]) / 3600;
    var blockNumber = payload[4];
    var reflectivity = Array.from(payload.slice(5));
    var weatherRadarReport = { latitude: latitude, longitude: longitude, blockNumber: blockNumber, reflectivity: reflectivity, };
    return weatherRadarReport;
}
function parseGdl90Weather(decodedBytes) {
    var messageType = decodedBytes[0];
    var payload = decodedBytes.slice(1, -1);
    if (messageType == 126) {
        return;
    }
    console.log("parseGdl90Weather: messageType=" + messageType);
    if (messageType === 31) {
        var weatherData = parseWeatherData(payload);
        var weatherRadar = parseWeatherRadarData(payload);
        if (weatherData) {
            console.log('Weather Data:', weatherData);
        }
        else {
            console.log('Invalid weather data payload');
        }
        if (weatherRadar != null) {
            console.log('Weather Radar:', weatherRadar);
        }
        else {
            console.log('Invalid weather radar payload');
        }
    } /* else {
        console.log('Message Type:', messageType);
        console.log('Payload:', payload);
    }*/
}
exports.parseGdl90Weather = parseGdl90Weather;
//# sourceMappingURL=weather-report.js.map