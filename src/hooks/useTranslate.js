import { useQuery } from '@tanstack/react-query'

async function googleTranslate(text, targetLang) {
  const url = new URL('https://translate.googleapis.com/translate_a/single')
  url.searchParams.set('client', 'gtx')
  url.searchParams.set('sl', 'en')
  url.searchParams.set('tl', targetLang)
  url.searchParams.set('dt', 't')
  url.searchParams.set('q', text)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Translation failed')
  const data = await res.json()
  // data[0] is an array of [translated_chunk, original_chunk, ...]
  return data[0]?.map(seg => seg[0]).join('') ?? text
}

/**
 * Translates `text` to `targetLang` when lang !== 'en'.
 * Returns { translated, isLoading } — falls back to original text on error.
 */
export function useTranslate(text, targetLang) {
  const enabled = Boolean(text) && targetLang === 'es'

  const { data, isLoading } = useQuery({
    queryKey: ['translate', targetLang, text],
    queryFn: () => googleTranslate(text, targetLang),
    enabled,
    staleTime: Infinity,   // translations never go stale
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  })

  return {
    translated: enabled ? (data ?? text) : text,
    isLoading: enabled && isLoading,
  }
}
