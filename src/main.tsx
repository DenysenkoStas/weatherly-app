import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// The offline forecast and city name moved to the service worker cache: drop the old copies
try {
  localStorage.removeItem('weatherly_last_weather')
  localStorage.removeItem('weatherly_last_city_name')
} catch {
  // Storage disabled: nothing to drop
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
