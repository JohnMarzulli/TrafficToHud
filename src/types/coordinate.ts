/**
 * GPS coordinates.
 */
export class Coordinate {
    /**
     * The East to West cooridinate.
     *
     * @type {number}
     * @memberof Coordinate
     */
    public readonly longitude: number;

    /**
     * The North to South coordinate.
     *
     * @type {number}
     * @memberof Coordinate
     */
    public readonly latitude: number;

    /**
     * Get the coordinate as a log/print friendly string.
     * @returns A log/print friendly string of the coordinate.
     */
    public toString(): string {
        return `[lon=${this.longitude}, lat=${this.latitude}]`;
    }

    /**
     * Form a coordinate
     * @param longitude The East to West cooridinate.
     * @param latitude The North to South coordinate.
     */
    public constructor(
        longitude: number,
        latitude: number
    ) {
        if (longitude > 180) {
            longitude -= 360;
        }

        this.longitude = longitude;
        this.latitude = latitude;
    }
}