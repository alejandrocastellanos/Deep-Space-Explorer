import axios from 'axios'

export const nasaApi = axios.create({
  baseURL: 'https://api.nasa.gov',
  params: { api_key: import.meta.env.VITE_NASA_API_KEY },
})

export const nasaImagesApi = axios.create({
  baseURL: 'https://images-api.nasa.gov',
})

export const issApi = axios.create({
  baseURL: 'https://api.open-notify.org',
})
