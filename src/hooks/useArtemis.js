import { useNASASearch } from './useNASASearch'

export function useArtemis() {
  return useNASASearch({ query: 'Artemis II', mediaType: 'image,video' })
}
