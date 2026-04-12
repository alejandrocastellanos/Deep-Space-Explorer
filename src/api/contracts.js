/**
 * API Data Contracts — Deep Space Explorer
 * Spec ref: §3
 *
 * APOD — spec §3.1
 * GET https://api.nasa.gov/planetary/apod
 * {
 *   url: string,
 *   hdurl: string,
 *   title: string,
 *   explanation: string,
 *   media_type: 'image' | 'video',
 *   date: string
 * }
 *
 * NASA Search — spec §3.2
 * GET https://images-api.nasa.gov/search?q=...&media_type=image,video
 * collection.items[i] = {
 *   data: [{ title, description, nasa_id, media_type, date_created }],
 *   links: [{ href: string }]
 * }
 *
 * NeoWs — spec §3.3
 * GET https://api.nasa.gov/neo/rest/v1/feed?start_date=X&end_date=Y
 * near_earth_objects[date][i] = {
 *   name: string,
 *   nasa_jpl_url: string,
 *   is_potentially_hazardous_asteroid: boolean,
 *   estimated_diameter: { kilometers: { estimated_diameter_min, estimated_diameter_max } },
 *   close_approach_data: [{ miss_distance: { kilometers }, relative_velocity: { kilometers_per_hour } }]
 * }
 *
 * ISS — spec §3.4
 * GET https://api.open-notify.org/iss-now.json
 * {
 *   iss_position: { latitude: string, longitude: string },
 *   timestamp: number,
 *   message: 'success'
 * }
 */
