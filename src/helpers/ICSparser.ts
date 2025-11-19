/* eslint-disable @typescript-eslint/no-explicit-any */
export async function parseICSFromURL(url: string): Promise<any[]> {
    
    const httpsUrl = url.replace(/^webcal:\/\//i, 'https://');

    const response = await fetch(httpsUrl);
    if (!response.ok) {
        console.error("Kunde inte hämta ICS:", response.statusText);
        return [];
    }

    const icsContent = await response.text();
    return parseICS(icsContent);
}

export function parseICS(icsContent: string): any[] {
  
    const events: any[] = [];
    const lines = icsContent.split('\n');

    let currentEvent: any = null;
    let inEvent = false;

    const uniqueUIDs = new Set<any>();
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        while (
            i + 1 < lines.length &&
            lines[i + 1].startsWith(' ')
        ) {
            line += lines[i + 1].substr(1);
            i++;
        }

        if (line === 'BEGIN:VEVENT') {
            inEvent = true;
            currentEvent = {};
        } else if (line === 'END:VEVENT') {
            if (
                currentEvent &&
                currentEvent.startTime &&
                currentEvent.endTime &&
                currentEvent.title &&
                currentEvent.id
            ) {
                if (!uniqueUIDs.has(currentEvent.id)) {
                    events.push(currentEvent);
                    uniqueUIDs.add(currentEvent.id);
                }
            }
            inEvent = false;
            currentEvent = null;
        } else if (inEvent && currentEvent) {
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) {
                continue;
            }
            const [keyPart, value] = [
                line.substring(0, colonIndex),
                line.substring(colonIndex + 1),
            ];

            const semiColonIndex = keyPart.indexOf(';');
            let key =
                semiColonIndex !== -1
                    ? keyPart.substring(0, semiColonIndex)
                    : keyPart;

            key = key.toUpperCase();

            switch (key) {
                case 'UID':
                    currentEvent.id = value;
                    break;
                case 'SUMMARY':
                    currentEvent.title = unescapeICSString(value);
                    break;
                case 'DESCRIPTION':
                    currentEvent.description = unescapeICSString(value);
                    break;
                case 'DTSTART':
                    currentEvent.startTime = parseICSDatetime(value);
                    break;
                case 'DTEND':
                    currentEvent.endTime = parseICSDatetime(value);
                    break;
                default:
                    break;
            }
        }
    }

    return events;
}

function parseICSDatetime(value: string): number {
    const semiColonIndex = value.indexOf(';');
    if (semiColonIndex !== -1) {
        value = value.substring(semiColonIndex + 1);
    }

    if (value.endsWith('Z')) {
        const dateString = value.substring(0, value.length - 1);
        return parseDateString(dateString, true);
    } else {
        return parseDateString(value, false);
    }
}

function parseDateString(dateString: string, isUTC: boolean): number {
    const year = parseInt(dateString.substr(0, 4), 10);
    const month = parseInt(dateString.substr(4, 2), 10) - 1;
    const day = parseInt(dateString.substr(6, 2), 10);
    let hour = 0;
    let minute = 0;
    let second = 0;

    if (dateString.length >= 15) {
        hour = parseInt(dateString.substr(9, 2), 10);
        minute = parseInt(dateString.substr(11, 2), 10);
        second = parseInt(dateString.substr(13, 2), 10);
    } else if (dateString.length === 8) {
        hour = 0;
        minute = 0;
        second = 0;
    } else {
        return NaN;
    }

    if (isUTC) {
        return Date.UTC(year, month, day, hour, minute, second);
    } else {
        return new Date(year, month, day, hour, minute, second).getTime();
    }
}

function unescapeICSString(value: string): string {
    return value
        .replace(/\\,/g, ',')
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n');
}
