/** How times are written: the app language and 12- or 24-hour clock */
export interface Clock {
  locale: string
  hour12: boolean
}

// The forecast's times are already the city's local time ("2026-11-27T14:15" or "14:15"):
// read the hour and minute and write them as they are, in UTC so nothing shifts them
function toUtcDate(time: string): Date | null {
  const match = /(\d{2}):(\d{2})$/.exec(time)
  if (!match) return null
  return new Date(Date.UTC(2000, 0, 1, Number(match[1]), Number(match[2])))
}

/** A city-local time, e.g. "07:54" or "7:54 AM" */
export function formatClock(time: string, { locale, hour12 }: Clock): string {
  const date = toUtcDate(time)
  if (!date) return time
  return new Intl.DateTimeFormat(locale, {
    hour: hour12 ? 'numeric' : '2-digit',
    minute: '2-digit',
    hour12,
    timeZone: 'UTC',
  }).format(date)
}

/** A full hour for the hourly scale: "23:00", or the shorter "11 PM" on a 12-hour clock */
export function formatHourLabel(time: string, clock: Clock): string {
  const date = toUtcDate(time)
  if (!date || !clock.hour12) return formatClock(time, clock)
  return new Intl.DateTimeFormat(clock.locale, {
    hour: 'numeric',
    hour12: true,
    timeZone: 'UTC',
  }).format(date)
}

/** A moment on this device's clock (when the data was loaded) */
export function formatDeviceTime(date: Date, { locale, hour12 }: Clock): string {
  return new Intl.DateTimeFormat(locale, {
    hour: hour12 ? 'numeric' : '2-digit',
    minute: '2-digit',
    hour12,
  }).format(date)
}
