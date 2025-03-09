import { CoordinateBoundaries } from "../types/boundaries";

const totalBinRowLength: number = 32;

/**
 * Stores reflectivity maps and provides a way to retrieve them.
 */
export class ReflectivityRadar {
    /**
     * Retrieve ALL of the reflectivity maps.
     * @param req The REST request bundle.
     * @returns A set of all known reflectivity blocks.
     */
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

    /**
     * Add or update reflectivity block report to the store.
     * @param report The report to add or update.
     */
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

                if (reportAgeSeconds > ReflectivityRadar.maxReportAgeSeconds) {
                    delete ReflectivityRadar.mapByReferenceId[id];
                }
            }
        }
    }

    private static maxReportAgeSeconds = 30 * 60;
    private static mapByReferenceId: any = {};
    private static lastGcTime: number = 0;
}

/**
 * Holds the data for a run of reflectivity
 */
export class BinRun {
    public readonly runLength: number;
    public readonly reflectivity: number;

    public constructor(
        runLength: number,
        reflectivity: number
    ) {
        this.runLength = runLength;
        this.reflectivity = reflectivity;
    }
}

/**
 * Holds the data for a reflectivity block.
 */
export class Reflectivity {
    /**
     *When was the report recieved?
     *
     * @type {number}
     * @memberof Reflectivity
     */
    public readonly reportTime: number;

    /**
     * What is the block Id of this data?
     *
     * @type {number}
     * @memberof Reflectivity
     */
    public readonly globalBlockReferenceId: number;

    /**
     * The NW and SE corners that are defined by the block Id.
     *
     * @type {CoordinateBoundaries}
     * @memberof Reflectivity
     */
    public readonly boundaries: CoordinateBoundaries;

    /**
     * The reflectivity data.
     *
     * @type {BinRun[][]}
     * @memberof Reflectivity
     */
    public readonly reflectivity: BinRun[][];

    /**
     * How old is the report?
     * @returns The age of the report in seconds.
     */
    public getReportAgeSeconds(): number {
        return (Date.now() - this.reportTime) / 1000;
    }

    /**
     * Build NEXRAD data from an uplink package.
     * @param globalBlockReferenceId The block Id that defines the coverage region.
     * @param boundaries The coordinate boundaries of the coverage region.
     * @param bins The bin data for the coverage blocks.
     */
    public constructor(
        globalBlockReferenceId: number,
        boundaries: CoordinateBoundaries,
        bins: BinRun[]
    ) {
        // TODO: Use the hour and minute from the message and combine it with the UTC date
        this.reportTime = Date.now();
        this.globalBlockReferenceId = globalBlockReferenceId;
        this.boundaries = boundaries;
        this.reflectivity = [];

        let binIndex = 0;

        while (binIndex < bins.length) {
            const row: BinRun[] = [];
            let rowSize = 0;

            // Keep the Run Length Encoding, but
            // limit it so the run never goes over into the
            // the next row. This will help with decoding on the render side.
            while (rowSize < totalBinRowLength) {
                const previousRowSize: number = rowSize;
                rowSize += bins[binIndex].runLength;

                if (rowSize >= totalBinRowLength) {
                    const maxAllowedRunSize = totalBinRowLength - previousRowSize;
                    const replacement: BinRun = new BinRun(bins[binIndex].runLength - maxAllowedRunSize, bins[binIndex].reflectivity);
                    const maxAllowed: BinRun = new BinRun(maxAllowedRunSize, bins[binIndex].reflectivity);
                    row.push(maxAllowed);
                    bins[binIndex] = replacement;

                    this.reflectivity.push(row);

                    if (replacement.runLength === 0) {
                        ++binIndex;
                    }
                }
                else {
                    row.push(bins[binIndex]);
                    ++binIndex;
                }

                if (binIndex >= bins.length) {
                    break;
                }
            }
        }
    }
}