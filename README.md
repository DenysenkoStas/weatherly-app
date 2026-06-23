# Weatherly

A weather web app built with React and TypeScript. Search for a city, use your current location, view a 7-day forecast, and save favorite cities.

**[Live demo](https://denysenkostas.github.io/weatherly-app/)**

## Features

- Current weather (temperature, feels like, humidity, wind)
- 7-day forecast with weather icons
- City search with debounced autocomplete
- Geolocation on first load
- Favorite cities persisted in `localStorage`
- EN / UA language toggle
- Skeleton loader while data is fetching

## Tech Stack

- React 19
- TypeScript
- Vite
- SCSS Modules
- [@meteocons/svg](https://github.com/basmilius/weather-icons) for weather icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format source files with Prettier |

## APIs

No API keys required.

| Service | Purpose |
|---------|---------|
| [Open-Meteo Forecast](https://open-meteo.com/) | Current weather and daily forecast |
| [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) | City search |
| [Nominatim](https://nominatim.openstreetmap.org/) | Reverse geocoding (city name from coordinates) |

## Project Structure

```
src/
├── components/   # UI components
├── hooks/        # Data fetching and app state
├── locales/      # EN / UA translations
├── types/        # TypeScript interfaces
└── utils/        # WMO weather codes and icons
```

## Deployment

The app deploys to GitHub Pages on every push to `master` via GitHub Actions. The base path is configured in `vite.config.ts` as `/weatherly-app/`.
