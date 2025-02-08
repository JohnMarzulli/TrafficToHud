import { CoordinateBoundaries } from "../types/boundaries";
export declare class ReflectivityRadar {
    private static MaxReportAgeSeconds;
    private static mapByReferenceId;
    private static lastGcTime;
    static getReflectivity(req: Request): any;
    static addReport(report: Reflectivity): void;
    private static removeOldReports;
}
export declare class Reflectivity {
    readonly reportTime: number;
    readonly globalBlockReferenceId: number;
    readonly boundaries: CoordinateBoundaries;
    readonly reflectivity: number[][];
    getReportAgeSeconds(): number;
    constructor(globalBlockReferenceId: number, boundaries: CoordinateBoundaries, bins: number[]);
}
