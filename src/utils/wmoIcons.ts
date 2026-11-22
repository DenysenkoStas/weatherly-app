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

import clearNight from '@meteocons/svg/fill/clear-night.svg?url'
import mostlyClearNight from '@meteocons/svg/fill/mostly-clear-night.svg?url'
import partlyCloudyNight from '@meteocons/svg/fill/partly-cloudy-night.svg?url'
import fogNight from '@meteocons/svg/fill/fog-night.svg?url'
import overcastNightRain from '@meteocons/svg/fill/overcast-night-rain.svg?url'
import overcastNightSnow from '@meteocons/svg/fill/overcast-night-snow.svg?url'
import thunderstormsNightHail from '@meteocons/svg/fill/thunderstorms-night-hail.svg?url'

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

// Codes whose icon shows the sun; the rest (overcast, rain, snow…) look the same at night
const nightIcons: Record<number, string> = {
  0: clearNight,
  1: mostlyClearNight,
  2: partlyCloudyNight,
  45: fogNight,
  48: fogNight,
  80: overcastNightRain,
  81: overcastNightRain,
  82: overcastNightRain,
  85: overcastNightSnow,
  86: overcastNightSnow,
  96: thunderstormsNightHail,
  99: thunderstormsNightHail,
}

export function getWeatherIcon(code: number, isDay = true): string {
  if (!isDay && nightIcons[code]) return nightIcons[code]
  return wmoIcons[code] ?? notAvailable
}
