# Weather Dashboard (Lattice Assignment)

A responsive React weather dashboard powered by the Open-Meteo APIs, with live GPS detection, current/hourly analytics, and historical climate trends.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Query
- ECharts

## Features Implemented

### Page 1: Current Weather & Hourly Forecast

- Auto GPS detection on app load (with safe fallback location)
- Date picker for selected-day weather analysis
- Individual weather metrics:
  - Temperature (min, max, current)
  - Precipitation, relative humidity, UV index
  - Sunrise and sunset
  - Max wind speed and precipitation probability
  - AQI, PM10, PM2.5, CO, CO2, NO2, SO2
- Hourly charts:
  - Temperature (C/F toggle)
  - Relative humidity
  - Precipitation
  - Visibility
  - Wind speed (10m)
  - PM10 + PM2.5 combined

### Page 2: Historical Date Range (Max 2 Years)

- Separate historical view
- Date-range selection (hard-limited to 2 years)
- Historical visualizations:
  - Temperature mean/max/min
  - Sun cycle (sunrise/sunset) in IST
  - Total precipitation
  - Wind max + dominant direction
  - PM10 + PM2.5 trends

### Visualization/UI Standards

All charts include:

- Horizontal navigation on dense datasets
- Zoom interactions
- Mobile-adaptive axis/legend behavior for legibility

Interaction model:

- Desktop: mouse wheel zoom + drag/pan
- Mobile: pinch zoom + swipe/drag pan

## Performance Strategy

To improve practical response time and UX:

- React Query caching and stale-time tuning
- localStorage-backed cached placeholders for instant repeat renders
- Retry with exponential backoff for API resilience
- Code splitting with vendor chunk optimization
- Lazy-loaded route modules

> Note: First-load API/network latency depends on client network, geolocation permission, and external API response time. Repeat loads are optimized to render from cache quickly.

## Getting Started

```bash
npm install
npm run dev
```

## Build & Quality Checks

```bash
npm run build
npm run lint
```
