import { useQuery } from '@tanstack/react-query'
import { issApi } from '../api/nasaApi'

export function useISSPosition() {
  return useQuery({
    queryKey: ['iss-position'],
    queryFn: () =>
      issApi.get('/satellites/25544').then(r => ({
        lat: parseFloat(r.data.latitude),
        lng: parseFloat(r.data.longitude),
        timestamp: r.data.timestamp,
      })),
    refetchInterval: 5000,
    staleTime: 0,
  })
}
