import { utcToZonedTime } from "date-fns-tz"


export function checkTimezoneSettings(): void {
    const enablePresenceUpdates: string | undefined = process.env.enable_presence_updates
    const presenceTextChannel: string | undefined = process.env.presence_text_channel_updates
    const timezone: string | undefined = process.env.timezone

    // Check if the date-fns timezone has been set correctly
    if (enablePresenceUpdates === 'true') {
        if (presenceTextChannel === undefined) {
            console.error(`presenceTextChannel is undefined in .env while enablePresenceUpdates was true`)
            process.exit(1)
        }
        if (timezone === undefined) {
            console.error(`timezone is undefined while enablePresenceUpdates was true`)
            process.exit(1)
        }

        try {
            const zonedDate: Date = utcToZonedTime(new Date(), timezone)
        } catch (error) {
            console.error(`Invalid timezone set in .env: ${error}`)
            process.exit(1)
        }
    }
}