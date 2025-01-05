import { CoordinateBoundaries } from "../types/boundaries";

export class ReflectivityRadar {
    private static MaxReportAgeSeconds = 15 * 60;
    private static mapByReferenceId: Map<number, Reflectivity> = new Map<number, Reflectivity>();

    public static addReflectivity(
        report: Reflectivity,
    ): void {
        ReflectivityRadar.mapByReferenceId.set(report.globalBlockReferenceId, report);

        ReflectivityRadar.removeOldReports();
    }

    private static removeOldReports(): void {
        const now = Date.now();

        ReflectivityRadar.mapByReferenceId.forEach((report, id) => {
            const reportAgeSeconds: number = (now - report.reportTime) / 1000;

            if (reportAgeSeconds > ReflectivityRadar.MaxReportAgeSeconds) {
                ReflectivityRadar.mapByReferenceId.delete(id);
            }
        });
    }
}

export class Reflectivity {
    public readonly reportTime: number;
    public readonly globalBlockReferenceId: number;
    public readonly boundaries: CoordinateBoundaries;
    public readonly reflectivity: number[][];

    public getReportAgeSeconds(): number {
        return (Date.now() - this.reportTime) / 1000;
    }

    public constructor(
        globalBlockReferenceId: number,
        boundaries: CoordinateBoundaries,
        bins: number[]
    ) {
        // TODO: Use the hour and minute from the message and combine it with the UTC date
        this.reportTime = Date.now();
        this.globalBlockReferenceId = globalBlockReferenceId;
        this.boundaries = boundaries;
        this.reflectivity = [];

        while (bins.length > 0) {
            const row = bins.splice(0, 32);

            this.reflectivity.push(row);
        }
    }
}