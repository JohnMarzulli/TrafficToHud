"use strict";
/**
 * The types of text reports that we can handle.
 */

export enum ReportType {
    /**
     * A pure text report. Will also include NOTAMs.
     */
    Text = "TEXT",

    /**
     * An airmet
     */
    Airmet = "AIRMET",

    /**
     * A METAR for a station
     */
    Metar = "METAR",

    /**
     * A TAF for a station.
     */
    Taf = "TAF"
}
