import { CoordinateBoundaries } from "../types/boundaries";

export class ReflectivityRadar {
    private static MaxReportAgeSeconds = 15 * 60;
    private static mapByReferenceId: any = {};
    private static lastGcTime: number = 0;

    public static getReflectivity(
        req: Request
    ): any {
        const secondsSinceLastGc = (Date.now() - ReflectivityRadar.lastGcTime) / 1000;

        if (secondsSinceLastGc > 60) {
            ReflectivityRadar.removeOldReports();

            ReflectivityRadar.lastGcTime = Date.now();
        }

        return ReflectivityRadar.mapByReferenceId;
    }

    public static addReport(
        report: Reflectivity,
    ): void {
        ReflectivityRadar.mapByReferenceId[report.globalBlockReferenceId] = report;
    }

    private static removeOldReports(): void {
        const now = Date.now();

        for (const id in ReflectivityRadar.mapByReferenceId) {
            if (ReflectivityRadar.mapByReferenceId.hasOwnProperty(id)) {
                const report = ReflectivityRadar.mapByReferenceId[id];
                const reportAgeSeconds: number = (now - report.reportTime) / 1000;

                if (reportAgeSeconds > ReflectivityRadar.MaxReportAgeSeconds) {
                    delete ReflectivityRadar.mapByReferenceId[id];
                }
            }
        }
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