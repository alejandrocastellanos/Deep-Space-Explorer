import { useQuery } from '@tanstack/react-query'
import { nasaApi } from '../api/nasaApi'

export function useAPOD() {
  return useQuery({
    queryKey: ['apod'],
    queryFn: () => nasaApi.get('/planetary/apod').then(r => r.data),
    staleTime: 1000 * 60 * 60 * 24,
  })
}
