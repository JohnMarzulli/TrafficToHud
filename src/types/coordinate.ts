export class Coordinate {
    public readonly longtitude: number;
    public readonly latitude: number;

    public toString(): string {
        return `[lon=${this.longtitude}, lat=${this.latitude}]`;
    }

    public constructor(
        longtitude: number,
        latitude: number
    ) {
        if (longtitude > 180) {
            longtitude -= 360;
        }

        this.longtitude = longtitude;
        this.latitude = latitude;
    }
}