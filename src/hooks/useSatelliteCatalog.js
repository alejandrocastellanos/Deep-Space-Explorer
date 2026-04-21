import { useQuery } from '@tanstack/react-query'
import { useMemo, useCallback } from 'react'
import * as satellite from 'satellite.js'
import { celestrakApi, SAT_GROUPS } from '../api/celestrakApi'

/**
 * Parse a 3-line TLE text blob:
 *   SATELLITE NAME
 *   1 XXXXX...
 *   2 XXXXX...
 */
function parseTLE(text, category, color, limit) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const records = []
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const name  = lines[i]
    const line1 = lines[i + 1]
    const line2 = lines[i + 2]
    if (!line1.startsWith('1 ') || !line2.startsWith('2 ')) continue
    try {
      const satrec = satellite.twoline2satrec(line1, line2)
      if (satrec.error !== 0) continue
      records.push({ name, satrec, category, color })
    } catch { /* skip malformed */ }
    if (limit && records.length >= limit) break
  }
  return records
}

/** Propagate one record to the given Date → { lat, lng, alt, name, category, color } */
function propagateOne(rec, date) {
  try {
    const posVel = satellite.propagate(rec.satrec, date)
    if (!posVel || !posVel.position) return null
    const gmst = satellite.gstime(date)
    const geo  = satellite.eciToGeodetic(posVel.position, gmst)
    return {
      name:     rec.name,
      category: rec.category,
      color:    rec.color,
      lat: satellite.degreesLat(geo.latitude),
      lng: satellite.degreesLong(geo.longitude),
      alt: geo.height, // km above Earth surface
    }
  } catch { return null }
}

/**
 * Fetches TLE data for all four satellite groups from CelesTrak.
 * Returns a stable `getPositions(date, activeCategories)` propagation function.
 */
export function useSatelliteCatalog() {
  const queries = SAT_GROUPS.map(group =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['celestrak-tle', group.key],
      queryFn: () =>
        celestrakApi
          .get(`/gp.php?GROUP=${group.group}&FORMAT=TLE`)
          .then(r => parseTLE(r.data, group.key, group.color, group.limit)),
      staleTime: 5 * 60 * 1000, // TLEs valid for 5 min cache
      retry: 2,
    })
  )

  const isLoading = queries.some(q => q.isLoading)
  const isError   = queries.every(q => q.isError)

  const allRecords = useMemo(
    () => queries.flatMap(q => q.data ?? []),
    // depend on each query's update timestamp so memo busts when data arrives
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queries.map(q => q.dataUpdatedAt).join(',')]
  )

  const getPositions = useCallback(
    (date, activeCategories) =>
      allRecords
        .filter(r => activeCategories.has(r.category))
        .map(r => propagateOne(r, date))
        .filter(Boolean),
    [allRecords]
  )

  return { getPositions, isLoading, isError, totalCount: allRecords.length }
}
