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
export declare function parseGdl90Weather(decodedBytes: Uint8Array): void;
