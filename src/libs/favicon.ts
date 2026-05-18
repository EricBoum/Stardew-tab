import { getDbValue, setDbValue } from '@/libs/db'
import { getIconBlob, saveIconBlob } from '@/libs/db/iconRepository'

interface FaviconCandidate {
  name: string;
  url: string;
}

export interface FaviconResult {
  iconId?: string;
  logo: string;
  provider?: string;
  fromCache?: boolean;
}

interface FaviconCacheRecord {
  hostname: string;
  iconId: string;
  logo: string;
  provider?: string;
  updatedAt: number;
}

interface ResolveFaviconOptions {
  forceRefresh?: boolean;
}

const FAVICON_CACHE_PREFIX = 'favicon:'
const FAVICON_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 30

const getHostname = (url: string): string => {
  return new URL(url).hostname
}

const getCacheKey = (hostname: string): string => {
  return `${ FAVICON_CACHE_PREFIX }${ hostname }`
}

export const getFaviconCandidates = (siteUrl: string): FaviconCandidate[] => {
  const hostname = getHostname(siteUrl)
  const encodedDomain = encodeURIComponent(hostname)

  return [
    {
      name: 'google',
      url: `https://www.google.com/s2/favicons?domain=${ encodedDomain }&sz=128`
    },
    {
      name: 'faviconkit',
      url: `https://ico.faviconkit.net/${ encodedDomain }/128`
    },
    {
      name: 'duckduckgo',
      url: `https://icons.duckduckgo.com/ip3/${ encodedDomain }.ico`
    }
  ]
}

const getCachedFavicon = async (hostname: string): Promise<FaviconResult | undefined> => {
  const record = await getDbValue<FaviconCacheRecord>(getCacheKey(hostname)).catch(() => undefined)
  if (!record || Date.now() - record.updatedAt > FAVICON_CACHE_MAX_AGE) {
    return undefined
  }

  const blob = await getIconBlob(record.iconId).catch(() => undefined)
  if (!blob) {
    return undefined
  }

  return {
    iconId: record.iconId,
    logo: record.logo,
    provider: record.provider,
    fromCache: true
  }
}

const isImageLikeBlob = (blob: Blob): boolean => {
  if (!blob.size) {
    return false
  }
  return !blob.type
    || blob.type.startsWith('image/')
    || blob.type === 'application/octet-stream'
}

const fetchImageBlob = async (url: string): Promise<Blob> => {
  const response = await fetch(url, {
    credentials: 'omit'
  })
  if (!response.ok) {
    throw new Error(`Favicon request failed: ${ response.status }`)
  }
  const blob = await response.blob()
  if (!isImageLikeBlob(blob)) {
    throw new Error('Favicon response is not an image')
  }
  return blob
}

const cacheFavicon = async (hostname: string, result: FaviconResult): Promise<void> => {
  if (!result.iconId) {
    return
  }
  await setDbValue<FaviconCacheRecord>(getCacheKey(hostname), {
    hostname,
    iconId: result.iconId,
    logo: result.logo,
    provider: result.provider,
    updatedAt: Date.now()
  }).catch(() => undefined)
}

export const resolveFavicon = async (siteUrl: string, options: ResolveFaviconOptions = {}): Promise<FaviconResult> => {
  const hostname = getHostname(siteUrl)
  if (!options.forceRefresh) {
    const cached = await getCachedFavicon(hostname)
    if (cached) {
      return cached
    }
  }

  const candidates = getFaviconCandidates(siteUrl)

  for (const candidate of candidates) {
    try {
      const blob = await fetchImageBlob(candidate.url)
      const iconId = await saveIconBlob(blob).catch(() => undefined)
      const result = {
        iconId,
        logo: candidate.url,
        provider: candidate.name
      }
      await cacheFavicon(hostname, result)
      return result
    } catch (error) {
      console.debug(`Failed to resolve favicon from ${ candidate.name }`, error)
    }
  }

  return {
    logo: candidates[0]?.url || ''
  }
}
