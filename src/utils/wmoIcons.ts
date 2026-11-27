import clearDayAnimated from '@meteocons/svg/fill/clear-day.svg?url'
import clearDayStill from '@meteocons/svg-static/fill/clear-day.svg?url'
import mostlyClearDayAnimated from '@meteocons/svg/fill/mostly-clear-day.svg?url'
import mostlyClearDayStill from '@meteocons/svg-static/fill/mostly-clear-day.svg?url'
import partlyCloudyDayAnimated from '@meteocons/svg/fill/partly-cloudy-day.svg?url'
import partlyCloudyDayStill from '@meteocons/svg-static/fill/partly-cloudy-day.svg?url'
import overcastAnimated from '@meteocons/svg/fill/overcast.svg?url'
import overcastStill from '@meteocons/svg-static/fill/overcast.svg?url'
import fogDayAnimated from '@meteocons/svg/fill/fog-day.svg?url'
import fogDayStill from '@meteocons/svg-static/fill/fog-day.svg?url'
import drizzleAnimated from '@meteocons/svg/fill/drizzle.svg?url'
import drizzleStill from '@meteocons/svg-static/fill/drizzle.svg?url'
import rainAnimated from '@meteocons/svg/fill/rain.svg?url'
import rainStill from '@meteocons/svg-static/fill/rain.svg?url'
import snowAnimated from '@meteocons/svg/fill/snow.svg?url'
import snowStill from '@meteocons/svg-static/fill/snow.svg?url'
import raindropAnimated from '@meteocons/svg/fill/raindrop.svg?url'
import raindropStill from '@meteocons/svg-static/fill/raindrop.svg?url'
import sleetAnimated from '@meteocons/svg/fill/sleet.svg?url'
import sleetStill from '@meteocons/svg-static/fill/sleet.svg?url'
import snowflakeAnimated from '@meteocons/svg/fill/snowflake.svg?url'
import snowflakeStill from '@meteocons/svg-static/fill/snowflake.svg?url'
import overcastDayRainAnimated from '@meteocons/svg/fill/overcast-day-rain.svg?url'
import overcastDayRainStill from '@meteocons/svg-static/fill/overcast-day-rain.svg?url'
import overcastDaySnowAnimated from '@meteocons/svg/fill/overcast-day-snow.svg?url'
import overcastDaySnowStill from '@meteocons/svg-static/fill/overcast-day-snow.svg?url'
import thunderstormsAnimated from '@meteocons/svg/fill/thunderstorms.svg?url'
import thunderstormsStill from '@meteocons/svg-static/fill/thunderstorms.svg?url'
import thunderstormsDayHailAnimated from '@meteocons/svg/fill/thunderstorms-day-hail.svg?url'
import thunderstormsDayHailStill from '@meteocons/svg-static/fill/thunderstorms-day-hail.svg?url'
import notAvailableAnimated from '@meteocons/svg/fill/not-available.svg?raw'
import notAvailableStill from '@meteocons/svg-static/fill/not-available.svg?raw'
import clearNightAnimated from '@meteocons/svg/fill/clear-night.svg?url'
import clearNightStill from '@meteocons/svg-static/fill/clear-night.svg?url'
import mostlyClearNightAnimated from '@meteocons/svg/fill/mostly-clear-night.svg?url'
import mostlyClearNightStill from '@meteocons/svg-static/fill/mostly-clear-night.svg?url'
import partlyCloudyNightAnimated from '@meteocons/svg/fill/partly-cloudy-night.svg?url'
import partlyCloudyNightStill from '@meteocons/svg-static/fill/partly-cloudy-night.svg?url'
import fogNightAnimated from '@meteocons/svg/fill/fog-night.svg?url'
import fogNightStill from '@meteocons/svg-static/fill/fog-night.svg?url'
import overcastNightRainAnimated from '@meteocons/svg/fill/overcast-night-rain.svg?url'
import overcastNightRainStill from '@meteocons/svg-static/fill/overcast-night-rain.svg?url'
import overcastNightSnowAnimated from '@meteocons/svg/fill/overcast-night-snow.svg?url'
import overcastNightSnowStill from '@meteocons/svg-static/fill/overcast-night-snow.svg?url'
import thunderstormsNightHailAnimated from '@meteocons/svg/fill/thunderstorms-night-hail.svg?url'
import thunderstormsNightHailStill from '@meteocons/svg-static/fill/thunderstorms-night-hail.svg?url'
import moonNewAnimated from '@meteocons/svg/fill/moon-new.svg?raw'
import moonNewStill from '@meteocons/svg-static/fill/moon-new.svg?raw'
import moonWaxingCrescentAnimated from '@meteocons/svg/fill/moon-waxing-crescent.svg?raw'
import moonWaxingCrescentStill from '@meteocons/svg-static/fill/moon-waxing-crescent.svg?raw'
import moonFirstQuarterAnimated from '@meteocons/svg/fill/moon-first-quarter.svg?raw'
import moonFirstQuarterStill from '@meteocons/svg-static/fill/moon-first-quarter.svg?raw'
import moonWaxingGibbousAnimated from '@meteocons/svg/fill/moon-waxing-gibbous.svg?raw'
import moonWaxingGibbousStill from '@meteocons/svg-static/fill/moon-waxing-gibbous.svg?raw'
import moonFullAnimated from '@meteocons/svg/fill/moon-full.svg?raw'
import moonFullStill from '@meteocons/svg-static/fill/moon-full.svg?raw'
import moonWaningGibbousAnimated from '@meteocons/svg/fill/moon-waning-gibbous.svg?raw'
import moonWaningGibbousStill from '@meteocons/svg-static/fill/moon-waning-gibbous.svg?raw'
import moonLastQuarterAnimated from '@meteocons/svg/fill/moon-last-quarter.svg?raw'
import moonLastQuarterStill from '@meteocons/svg-static/fill/moon-last-quarter.svg?raw'
import moonWaningCrescentAnimated from '@meteocons/svg/fill/moon-waning-crescent.svg?raw'
import moonWaningCrescentStill from '@meteocons/svg-static/fill/moon-waning-crescent.svg?raw'
import type { IconSources } from '../types'
import type { PrecipitationType } from './nowcast'
import type { MoonPhase } from './moon'
import { withVisibleDetails } from './iconColors'

const clearDay: IconSources = { animated: clearDayAnimated, still: clearDayStill }
const mostlyClearDay: IconSources = { animated: mostlyClearDayAnimated, still: mostlyClearDayStill }
const partlyCloudyDay: IconSources = {
  animated: partlyCloudyDayAnimated,
  still: partlyCloudyDayStill,
}
const overcast: IconSources = { animated: overcastAnimated, still: overcastStill }
const fogDay: IconSources = { animated: fogDayAnimated, still: fogDayStill }
const drizzle: IconSources = { animated: drizzleAnimated, still: drizzleStill }
const rain: IconSources = { animated: rainAnimated, still: rainStill }
const snow: IconSources = { animated: snowAnimated, still: snowStill }
const snowflake: IconSources = { animated: snowflakeAnimated, still: snowflakeStill }
const raindrop: IconSources = { animated: raindropAnimated, still: raindropStill }
const sleet: IconSources = { animated: sleetAnimated, still: sleetStill }
const overcastDayRain: IconSources = {
  animated: overcastDayRainAnimated,
  still: overcastDayRainStill,
}
const overcastDaySnow: IconSources = {
  animated: overcastDaySnowAnimated,
  still: overcastDaySnowStill,
}
const thunderstorms: IconSources = { animated: thunderstormsAnimated, still: thunderstormsStill }
const thunderstormsDayHail: IconSources = {
  animated: thunderstormsDayHailAnimated,
  still: thunderstormsDayHailStill,
}
const notAvailable: IconSources = {
  animated: withVisibleDetails(notAvailableAnimated),
  still: withVisibleDetails(notAvailableStill),
}
const clearNight: IconSources = { animated: clearNightAnimated, still: clearNightStill }
const mostlyClearNight: IconSources = {
  animated: mostlyClearNightAnimated,
  still: mostlyClearNightStill,
}
const partlyCloudyNight: IconSources = {
  animated: partlyCloudyNightAnimated,
  still: partlyCloudyNightStill,
}
const fogNight: IconSources = { animated: fogNightAnimated, still: fogNightStill }
const overcastNightRain: IconSources = {
  animated: overcastNightRainAnimated,
  still: overcastNightRainStill,
}
const overcastNightSnow: IconSources = {
  animated: overcastNightSnowAnimated,
  still: overcastNightSnowStill,
}
const thunderstormsNightHail: IconSources = {
  animated: thunderstormsNightHailAnimated,
  still: thunderstormsNightHailStill,
}

export const wmoIcons: Record<number, IconSources> = {
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
const nightIcons: Record<number, IconSources> = {
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

export function getWeatherIcon(code: number, isDay = true): IconSources {
  if (!isDay && nightIcons[code]) return nightIcons[code]
  return wmoIcons[code] ?? notAvailable
}

const precipitationIcons: Record<PrecipitationType, IconSources> = {
  rain: raindrop,
  snow: snowflake,
  mixed: sleet,
}

export function getPrecipitationIcon(type: PrecipitationType): IconSources {
  return precipitationIcons[type]
}

// Raw, so the near-black details of some moons stay visible on the dark card
const moonIcon = (animated: string, still: string): IconSources => ({
  animated: withVisibleDetails(animated),
  still: withVisibleDetails(still),
})

const moonIcons: Record<MoonPhase, IconSources> = {
  new: moonIcon(moonNewAnimated, moonNewStill),
  waxing_crescent: moonIcon(moonWaxingCrescentAnimated, moonWaxingCrescentStill),
  first_quarter: moonIcon(moonFirstQuarterAnimated, moonFirstQuarterStill),
  waxing_gibbous: moonIcon(moonWaxingGibbousAnimated, moonWaxingGibbousStill),
  full: moonIcon(moonFullAnimated, moonFullStill),
  waning_gibbous: moonIcon(moonWaningGibbousAnimated, moonWaningGibbousStill),
  last_quarter: moonIcon(moonLastQuarterAnimated, moonLastQuarterStill),
  waning_crescent: moonIcon(moonWaningCrescentAnimated, moonWaningCrescentStill),
}

export function getMoonIcon(phase: MoonPhase): IconSources {
  return moonIcons[phase]
}
