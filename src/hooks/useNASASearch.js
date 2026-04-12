import { useQuery } from '@tanstack/react-query'
import { nasaImagesApi } from '../api/nasaApi'

function mapItems(items = []) {
  return items.map(item => ({
    id: item.data?.[0]?.nasa_id ?? Math.random().toString(),
    title: item.data?.[0]?.title ?? 'Untitled',
    description: item.data?.[0]?.description ?? '',
    mediaType: item.data?.[0]?.media_type ?? 'image',
    thumbnail: item.links?.[0]?.href ?? null,
    date: item.data?.[0]?.date_created ?? '',
  }))
}

export function useNASASearch({ query, mediaType = 'image,video' }) {
  return useQuery({
    queryKey: ['nasa-search', query, mediaType],
    queryFn: () =>
      nasaImagesApi
        .get('/search', { params: { q: query, media_type: mediaType } })
        .then(r => mapItems(r.data?.collection?.items)),
    enabled: Boolean(query),
    staleTime: 1000 * 60 * 10,
  })
}
