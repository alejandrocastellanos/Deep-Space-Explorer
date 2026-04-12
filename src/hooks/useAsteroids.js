import { useQuery } from '@tanstack/react-query'
import { nasaApi } from '../api/nasaApi'

function toYMD(date) {
  return date.toISOString().slice(0, 10)
}

export function useAsteroids() {
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  const startDate = toYMD(today)
  const endDate = toYMD(nextWeek)

  return useQuery({
    queryKey: ['asteroids', startDate],
    queryFn: () =>
      nasaApi
        .get('/neo/rest/v1/feed', { params: { start_date: startDate, end_date: endDate } })
        .then(r => {
          const all = Object.values(r.data.near_earth_objects).flat()
          const mapped = all.map(neo => ({
            id: neo.id,
            name: neo.name,
            url: neo.nasa_jpl_url,
            isHazardous: neo.is_potentially_hazardous_asteroid,
            diameterMin: neo.estimated_diameter?.kilometers?.estimated_diameter_min ?? 0,
            diameterMax: neo.estimated_diameter?.kilometers?.estimated_diameter_max ?? 0,
            velocity: neo.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour ?? '0',
            missDistance: neo.close_approach_data?.[0]?.miss_distance?.kilometers ?? '0',
            approachDate: neo.close_approach_data?.[0]?.close_approach_date ?? '',
          }))
          // Hazardous first
          mapped.sort((a, b) => b.isHazardous - a.isHazardous)
          return {
            asteroids: mapped,
            hazardousCount: mapped.filter(a => a.isHazardous).length,
          }
        }),
    staleTime: 1000 * 60 * 30,
  })
}
