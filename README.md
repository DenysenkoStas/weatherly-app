# Weatherly

A weather web app built with React and TypeScript. Search for a city or use your current location to see the weather now, an hourly and 16-day forecast, and air quality. Save favorite cities, share a link to a city, and install the app to use it offline.

**[Live demo](https://denysenkostas.github.io/weatherly-app/)**

## Features

**Weather**

- Current weather: temperature, feels like, humidity, wind speed and direction, pressure, UV index, precipitation
- Comparison with yesterday at the same hour ("3° colder than yesterday")
- Rain and snow in the next 2 hours ("Rain expected around 14:15")
- Sunrise, sunset, and daylight progress
- 16-day forecast with daily highs, lows, and chance of precipitation
- Hourly forecast for each day with a temperature chart
- Air quality: European AQI, PM2.5, PM10, and pollen in season (Europe)
- Day and night weather icons, background tinted by the current sky

**Cities**

- City search with debounced autocomplete and keyboard navigation
- Current location via the browser's geolocation
- Opens the last viewed city on start
- Shareable links: the city is kept in the address (`?lat=…&lon=…`)
- Favorite cities: remove from the chip, reorder by dragging (or Alt + ←/→)

**App**

- Installable PWA; the app and the last forecast work offline
- Refreshes stale data when you return to the tab
- °C / °F and m/s / km/h units
- Animation setting: auto (follows the system's reduced motion), on, or off
- Light and dark themes, EN / UA languages
- Responsive layout from phones to wide desktops
- Skeletons that match the loaded cards, so nothing jumps

## Tech Stack

- React 19
- TypeScript
- Vite
- SCSS Modules
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) for the service worker and manifest
- [@meteocons/svg](https://github.com/basmilius/meteocons) and [@meteocons/svg-static](https://github.com/basmilius/meteocons) for weather icons (still copies when animation is off)
- Vitest and Testing Library for tests

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173/weatherly-app/](http://localhost:5173/weatherly-app/) in your browser.

The service worker is only active in a production build: use `npm run build` and `npm run preview`, then open [http://localhost:4173/weatherly-app/](http://localhost:4173/weatherly-app/).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run format` | Format source files with Prettier |
| `npm run format:check` | Check formatting with Prettier |

## APIs

No API keys required.

| Service | Purpose |
|---------|---------|
| [Open-Meteo Forecast](https://open-meteo.com/) | Current weather, precipitation for the next 2 hours, hourly and daily forecast, yesterday's temperatures |
| [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api) | European AQI, particulate matter, and pollen |
| [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) | City search |
| [Nominatim](https://nominatim.openstreetmap.org/) | Reverse geocoding (city name from coordinates) |

## Project Structure

```
public/           # Favicon and PWA icons
src/
├── components/   # UI components, each in its own folder with a skeleton where needed
├── hooks/        # Data fetching and app state (weather, favorites, units, theme…)
├── locales/      # EN / UA translations
├── styles/       # Shared SCSS: breakpoints, skeleton and scrollbar mixins
├── test/         # Test setup
├── types/        # TypeScript interfaces
└── utils/        # Weather codes and icons, charts, coordinates, air quality…
```

Tests live next to the code they cover (`*.test.ts`, `*.test.tsx`).

## Deployment

Every push to `master` runs GitHub Actions: lint, formatting check, tests, and build, then deploys to GitHub Pages. The base path is configured in `vite.config.ts` as `/weatherly-app/`.
