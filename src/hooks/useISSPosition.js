import { useQuery } from '@tanstack/react-query'
import { issApi } from '../api/nasaApi'

export function useISSPosition() {
  return useQuery({
    queryKey: ['iss-position'],
    queryFn: () =>
      issApi.get('/iss-now.json').then(r => ({
        lat: parseFloat(r.data.iss_position.latitude),
        lng: parseFloat(r.data.iss_position.longitude),
        timestamp: r.data.timestamp,
      })),
    refetchInterval: 5000,
    staleTime: 0,
  })
}
