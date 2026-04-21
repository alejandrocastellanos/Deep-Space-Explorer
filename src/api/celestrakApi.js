import axios from 'axios'

export const celestrakApi = axios.create({
  baseURL: 'https://celestrak.org/NORAD/elements',
  responseType: 'text',
})

/**
 * Satellite group definitions.
 * Endpoint: /gp.php?GROUP={group}&FORMAT=TLE  (3-line TLE text, no API key needed)
 */
export const SAT_GROUPS = [
  {
    key: 'stations',
    label: 'Space Stations',
    group: 'stations',
    color: '#00f4fe',
    limit: null,
  },
  {
    key: 'starlink',
    label: 'Starlink',
    group: 'starlink',
    color: '#a855f7',
    limit: 300,
  },
  {
    key: 'gps',
    label: 'GPS',
    group: 'gps-ops',
    color: '#22c55e',
    limit: null,
  },
  {
    key: 'weather',
    label: 'Weather',
    group: 'weather',
    color: '#eab308',
    limit: null,
  },
]
