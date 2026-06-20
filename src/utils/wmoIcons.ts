import clearDay from '@meteocons/svg/fill/clear-day.svg?url'
import mostlyClearDay from '@meteocons/svg/fill/mostly-clear-day.svg?url'
import partlyCloudyDay from '@meteocons/svg/fill/partly-cloudy-day.svg?url'
import overcast from '@meteocons/svg/fill/overcast.svg?url'
import fogDay from '@meteocons/svg/fill/fog-day.svg?url'
import drizzle from '@meteocons/svg/fill/drizzle.svg?url'
import rain from '@meteocons/svg/fill/rain.svg?url'
import snow from '@meteocons/svg/fill/snow.svg?url'
import snowflake from '@meteocons/svg/fill/snowflake.svg?url'
import overcastDayRain from '@meteocons/svg/fill/overcast-day-rain.svg?url'
import overcastDaySnow from '@meteocons/svg/fill/overcast-day-snow.svg?url'
import thunderstorms from '@meteocons/svg/fill/thunderstorms.svg?url'
import thunderstormsDayHail from '@meteocons/svg/fill/thunderstorms-day-hail.svg?url'
import notAvailable from '@meteocons/svg/fill/not-available.svg?url'

export const wmoIcons: Record<number, string> = {
  0: clearDay,
  1: mostlyClearDay,
  2: partlyCloudyDay,
  3: overcast,
  45: fogDay,
  48: fogDay,
  51: drizzle,
  53: drizzle,
  55: drizzle,
  61: rain,
  63: rain,
  65: rain,
  71: snow,
  73: snow,
  75: snow,
  77: snowflake,
  80: overcastDayRain,
  81: overcastDayRain,
  82: overcastDayRain,
  85: overcastDaySnow,
  86: overcastDaySnow,
  95: thunderstorms,
  96: thunderstormsDayHail,
  99: thunderstormsDayHail,
}

export function getWeatherIcon(code: number): string {
  return wmoIcons[code] ?? notAvailable
}
