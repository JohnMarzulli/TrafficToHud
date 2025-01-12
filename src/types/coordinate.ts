export class Coordinate {
    public readonly longitude: number;
    public readonly latitude: number;

    public toString(): string {
        return `[lon=${this.longitude}, lat=${this.latitude}]`;
    }

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