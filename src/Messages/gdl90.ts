import { assert } from "console";
import * as DataHandling from "../data_handling";
import { LoggingObject, LogLevel } from "../logging_object";

export class Gdl90 {
    public readonly received_at: number;
    public readonly message_type: number;
    public readonly actual_checksum: number;
    public readonly expected_checksum: number;
    public readonly raw_message: string;
    public readonly message: Uint8Array;

    constructor(
        raw_message: string
    ) {
        this.received_at = Date.now();
        this.raw_message = raw_message.trim();
        this.message = DataHandling.unescapeData(DataHandling.getBytes(this.raw_message));

        this.actual_checksum = DataHandling.calculateChecksum(this.message);
        this.expected_checksum = this.message[this.message.length - 1];

        this.message_type = Number(this.message[1].toString());
    }
}

export abstract class Gdl90Message extends LoggingObject {
    public constructor(
        log_level: LogLevel = LogLevel.debug
    ) {
        super(log_level);
    }
}

export class GdlHeartbeat extends Gdl90Message {
    constructor(
        message: Gdl90
    ) {
        super(LogLevel.error);

        assert(message.message_type == 0);

        this.LogSpew(`HEARTBEAT: Status=${message.message[2]}/${message.message[3]}, TimeStamp=${message.message[4]}${message.message[5]}, MsgCounts=${message.message[6]}${message.message[7]}`);
    }
}

export class Ownship extends Gdl90Message {
    constructor(
        message: Gdl90
    ) {
        super(LogLevel.error);

        assert(message.message_type == 10);
        this.LogSpew(`OWNSHIP:${message.message}`);
    }
}

export class OwnshipAltitude extends Gdl90Message {
    constructor(
        message: Gdl90
    ) {
        super(LogLevel.error);

        assert(message.message_type == 11);
        this.LogSpew(`OWNSHIP:${message.message}`);
    }
}

export class OwnshipDetails extends Gdl90Message {
    constructor(
        message: Gdl90
    ) {
        super(LogLevel.error);

        const subType = message.message[2];

        assert(message.message_type == 101);
        assert(subType == 0);

        // Uses 3.5.1
        this.LogSpew(`OWNSHIP DETAILS: Sub=${subType}, DevName=${message.message.subarray(12, 19)}, DevLongName=${message.message.subarray(20, 35)}`);
    }
}

export class OwnshipAhrs extends Gdl90Message {
    constructor(
        message: Gdl90
    ) {
        super(LogLevel.error);

        const subType = message.message[2];

        assert(message.message_type == 101);
        assert(subType == 1);

        // Uses 3.5.1
        this.LogSpew(`OWNSHIP AHRS: Data=${message.message}`);
    }
}

export class Traffic extends Gdl90Message {
    constructor(
        message: Gdl90
    ) {
        super(LogLevel.error);

        assert(message.message_type == 20);
        // Uses 3.5.1
        // Pg 17 & 18
        // https://www.faa.gov/sites/faa.gov/files/air_traffic/technology/adsb/archival/GDL90_Public_ICD_RevA.PDF
        //if (deframedReport.length != 30) {
        //  this.LogError(`TRAFFIC: report.length=${report.length}`);
        //}
        this.LogSpew(`TRAFFIC:${message.message}`);
    }
}

export class StratuxHeartbeat extends Gdl90Message {
    constructor(
        message: Gdl90
    ) {
        super(LogLevel.error);

        assert(message.message_type == 204);

        this.LogSpew(`STRATUX HEARTBEAT:${message.message}`);
    }
}

export class BasicReport extends Gdl90Message {
    constructor(
        message: Gdl90
    ) {
        super(LogLevel.all);

        assert(message.message_type == 30);

        // Basic report
        // Pg 26, FAA
        // UAT?
        let timeOfReception = message.message.subarray(2, 4);
        let payload = message.message.slice(5);
        let icaoAddress = payload.slice(0, 3); // 3-byte ICAO address
        let flags = payload[3];               // Flags for type of data
        let latitude = (payload[4] << 16) | (payload[5] << 8) | payload[6]; // Latitude encoding
        let longitude = (payload[7] << 16) | (payload[8] << 8) | payload[9]; // Longitude encoding
        let altitude = (payload[10] << 8) | payload[11]; // Altitude
        let velocity = (payload[12] << 8) | payload[13]; // Velocity
        let additionalData = payload.slice(14); // Any remaining data

        this.LogSpew(`UAT BASIC MSG: TimeReceived=${timeOfReception}, ICAO=${icaoAddress}, flags=${flags}, lat=${latitude}, long=${longitude}, alt=${altitude}, vel=${velocity}, additional=${additionalData}, `);
    }
}

export class LongReport extends Gdl90Message {
    constructor(
        message: Gdl90
    ) {
        super(LogLevel.all);

        assert(message.message_type == 31);

        // Basic report
        // Pg 26, FAA
        // UAT?
        this.LogSpew(`UAT BASIC MSG: TimeReceived=${message.message.subarray(2, 4)}, Payload=${message.raw_message.substring(5, 38)}`);
    }
}

export class Uplink extends Gdl90Message {
    constructor(
        message: Gdl90
    ) {
        super(LogLevel.all);

        assert(message.message_type == 7);

        this.LogSpew(`UAT UPLINK:${message.message}`);
    }
}

export class StratuxStatus extends Gdl90Message {
    constructor(
        message: Gdl90
    ) {
        super(LogLevel.error);

        assert(message.message_type == 83);

        // Stratux Status
        // from gen_gdl90.go:495
        this.LogSpew(`STRATUX: SoftVer=${message.raw_message.substring(5, 8)}, HardVer=${message.raw_message.substring(9, 12)}, DataValid=${message.message[14]}, Unk=${message.message[15]}, HardStatus=${message.message[16]}, GpsLock=${message.message[17]}, Towers=${message.message.subarray(29)}`);
    }
}