export function unescapeData(
    data: Uint8Array
): Uint8Array {
    const ESCAPE_BYTE = 0x7D;
    const XOR_BYTE = 0x20;
    const result: number[] = [];

    for (let i = 0; i < data.length; i++) {
        if (data[i] === ESCAPE_BYTE && i + 1 < data.length) {
            result.push(data[i + 1] ^ XOR_BYTE);
            i++;
        } else {
            result.push(data[i]);
        }
    }

    return new Uint8Array(result);
}

export function calculateChecksum(
    data: Uint8Array
): number {
    return data.reduce((checksum, byte) => checksum ^ byte, 0);
}

export function getBytes(
    report: string
): Uint8Array {
    const decodedBytes = new Uint8Array(report.length);

    for (let i = 0; i < report.length; i++) {
        decodedBytes[i] = report.charCodeAt(i);
    }

    return decodedBytes;
}