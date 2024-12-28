export interface WeatherReport {
    temperature: number;
    windSpeed: number;
    windDirection: number;
}

export interface WeatherRadarReport {
    latitude: number;
    longitude: number;
    blockNumber: number;
    reflectivity: number[];
}

function parseWeatherData(payload: Uint8Array): WeatherReport | null {
    // This function should parse the weather data based on GDL90 specification
    // For example purposes, let's assume we have a fixed structure:
    if (payload.length < 8) {
        return null;
    }

    const temperature = payload[0];
    const windSpeed = payload[1];
    const windDirection = (payload[2] << 8) | payload[3];

    const weatherReport: WeatherReport = {
        temperature,
        windSpeed,
        windDirection,
    };

    return weatherReport;
}

function parseWeatherRadarData(payload: Uint8Array): WeatherRadarReport | null {
    if (payload.length < 12) { return null; }

    const latitude = ((payload[0] << 8) | payload[1]) / 3600;
    const longitude = ((payload[2] << 8) | payload[3]) / 3600;
    const blockNumber = payload[4];
    const reflectivity = Array.from(payload.slice(5));
    const weatherRadarReport: WeatherRadarReport = { latitude, longitude, blockNumber, reflectivity, };

    return weatherRadarReport;
}

export function parseGdl90Weather(decodedBytes: Uint8Array): void {
    const messageType = decodedBytes[0];
    const payload = decodedBytes.slice(1, -1);

    if (messageType == 126) {
        return;
    }

    console.log(`parseGdl90Weather: messageType=${messageType}`);

    if (messageType === 31) {
        const weatherData = parseWeatherData(payload);
        const weatherRadar = parseWeatherRadarData(payload);

        if (weatherData) {
            console.log('Weather Data:', weatherData);
        } else {
            console.log('Invalid weather data payload');
        }

        if (weatherRadar != null) {
            console.log('Weather Radar:', weatherRadar);
        } else {
            console.log('Invalid weather radar payload');
        }
    }/* else {
        console.log('Message Type:', messageType);
        console.log('Payload:', payload);
    }*/
}