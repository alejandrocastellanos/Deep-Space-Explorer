import { useQuery } from '@tanstack/react-query'
import { nasaImagesApi } from '../api/nasaApi'

export function useNASAAsset(nasaId) {
  return useQuery({
    queryKey: ['nasa-asset', nasaId],
    queryFn: () =>
      nasaImagesApi.get(`/asset/${nasaId}`).then(r => {
        const hrefs = r.data?.collection?.items?.map(i => i.href) ?? []
        const video = hrefs.find(h => h.endsWith('~mobile.mp4'))
          ?? hrefs.find(h => h.endsWith('.mp4'))
        const image = hrefs.find(h => h.includes('~orig.'))
          ?? hrefs.find(h => /\.(jpg|jpeg|png|gif|tif)$/i.test(h))
        return { video, image, all: hrefs }
      }),
    enabled: Boolean(nasaId),
    staleTime: 1000 * 60 * 60,
  })
}
