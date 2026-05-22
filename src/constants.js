export const NEWS_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2'
export const SNAPI_BASE = 'https://api.spaceflightnewsapi.net/v4'
export const NEWS_SITE_LOCATIONS = {
  SpaceNews: { city: 'Washington DC', lat: 38.9072, lng: -77.0369 },
  NASA: { city: 'Houston', lat: 29.7604, lng: -95.3698 },
  'ESA': { city: 'Paris', lat: 48.8566, lng: 2.3522 },
  'Teslarati': { city: 'Hawthorne', lat: 33.9164, lng: -118.3526 },
  'Ars Technica': { city: 'New York', lat: 40.7128, lng: -74.006 },
  'NASASpaceflight': { city: 'Boca Chica', lat: 25.9971, lng: -97.1566 },
}
export const MARKER_COLORS = ['#22d3ee', '#f472b6', '#a78bfa', '#34d399', '#f59e0b', '#60a5fa']

export const fallbackNews = [
  {
    id: 'article-fallback-1',
    title: 'Global energy transition reaches new investment high',
    summary:
      'Emerging markets and large economies are accelerating solar, storage, and grid modernization in Q2.',
    image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e',
    news_site: 'World Briefing',
    url: '#',
    published_at: new Date().toISOString(),
    location: 'Global Desk',
  },
  {
    id: 'article-fallback-2',
    title: 'International health agencies coordinate vaccine logistics',
    summary:
      'Shared analytics models are helping optimize supply routes and improve rural delivery outcomes.',
    image_url: 'https://images.unsplash.com/photo-1584515933487-779824d29309',
    news_site: 'Health Wire',
    url: '#',
    published_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    location: 'Global Desk',
  },
  {
    id: 'article-fallback-3',
    title: 'Maritime trade data signals stronger cross-region demand',
    summary:
      'Shipping corridors across Asia, Europe, and Africa are showing steady recovery in high-value goods.',
    image_url: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b',
    news_site: 'Economic Watch',
    url: '#',
    published_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    location: 'Global Desk',
  },
]

export const sentimentTimeline = [
  { time: '00:00', positive: 55, neutral: 28, risk: 17 },
  { time: '04:00', positive: 58, neutral: 25, risk: 17 },
  { time: '08:00', positive: 61, neutral: 24, risk: 15 },
  { time: '12:00', positive: 57, neutral: 27, risk: 16 },
  { time: '16:00', positive: 60, neutral: 24, risk: 16 },
  { time: '20:00', positive: 63, neutral: 22, risk: 15 },
]

export const hotspots = [
  { lat: 37.7749, lng: -122.4194, size: 0.35, city: 'San Francisco' },
  { lat: 48.8566, lng: 2.3522, size: 0.32, city: 'Paris' },
  { lat: 19.076, lng: 72.8777, size: 0.4, city: 'Mumbai' },
  { lat: -33.8688, lng: 151.2093, size: 0.28, city: 'Sydney' },
  { lat: -1.2921, lng: 36.8219, size: 0.25, city: 'Nairobi' },
]
