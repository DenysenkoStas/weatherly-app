import { describe, expect, it } from 'vitest'
import { formatClock, formatDeviceTime, formatHourLabel } from './time'

const en24 = { locale: 'en', hour12: false }
const en12 = { locale: 'en', hour12: true }
const uk12 = { locale: 'uk', hour12: true }

describe('formatClock', () => {
  it('writes city-local times as they are, with leading zeros on a 24-hour clock', () => {
    expect(formatClock('2026-11-27T07:54', en24)).toBe('07:54')
    expect(formatClock('14:15', en24)).toBe('14:15')
  })

  it('uses AM/PM in the app language on a 12-hour clock', () => {
    // ICU may put a narrow no-break space before AM/PM
    expect(formatClock('2026-11-27T14:15', en12)).toMatch(/^2:15\sPM$/)
    expect(formatClock('00:05', en12)).toMatch(/^12:05\sAM$/)
    expect(formatClock('14:15', uk12)).toMatch(/^2:15\sпп$/)
  })

  it('leaves text that is not a time alone', () => {
    expect(formatClock('soon', en12)).toBe('soon')
  })
})

describe('formatHourLabel', () => {
  it('drops the minutes on a 12-hour clock', () => {
    expect(formatHourLabel('2026-11-27T23:00', en12)).toMatch(/^11\sPM$/)
    expect(formatHourLabel('2026-11-27T23:00', en24)).toBe('23:00')
  })
})

describe('formatDeviceTime', () => {
  it('follows the chosen clock', () => {
    const date = new Date(2026, 10, 27, 21, 5)
    expect(formatDeviceTime(date, en24)).toBe('21:05')
    expect(formatDeviceTime(date, en12)).toMatch(/^9:05\sPM$/)
  })
})
