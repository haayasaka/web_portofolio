import { ref, onMounted } from 'vue'

/**
 * Resource cache — persisted for the entire page lifetime.
 * Resources are NEVER freed unless the user refreshes the page.
 *
 * We cache blob URLs instead of DOM elements so that <img src="...">
 * in the template renders instantly from memory — no second network
 * request, no lazy decode delay.
 */
const blobCache = new Map<string, string>()

/**
 * Track which resource sets have already been fully loaded.
 * Prevents re-triggering loading for the same set of resources.
 */
const loadedSets = new Set<string>()

const MAX_RETRIES = 5
const RETRY_DELAY_BASE = 800 // ms — doubles each retry (exponential back-off)

/**
 * Fetch a resource as a blob and return a local blob: URL.
 * The blob URL lives in memory and is guaranteed to render instantly.
 */
async function fetchAsBlob(src: string): Promise<string> {
  // Already cached — return immediately
  if (blobCache.has(src)) return blobCache.get(src)!

  const res = await fetch(src)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${src}`)
  const blob = await res.blob()
  const blobUrl = URL.createObjectURL(blob)
  blobCache.set(src, blobUrl)
  return blobUrl
}

/**
 * Load a single image: fetch as blob, then create an Image and
 * call decode() so the bitmap is fully ready for painting.
 */
async function loadImage(src: string): Promise<string> {
  const blobUrl = await fetchAsBlob(src)

  // Create a hidden Image and decode it to guarantee the bitmap
  // is ready for the compositor — prevents blank/white frames.
  const img = new Image()
  img.src = blobUrl
  await img.decode()

  return blobUrl
}

/**
 * Load a single video: fetch the first chunk so the browser can
 * start playback without additional network requests.
 */
async function loadVideo(src: string): Promise<string> {
  const blobUrl = await fetchAsBlob(src)

  // Create a hidden <video> and wait until enough data is buffered
  return new Promise<string>((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true

    const cleanup = () => {
      video.oncanplaythrough = null
      video.onerror = null
    }

    video.oncanplaythrough = () => {
      cleanup()
      resolve(blobUrl)
    }
    video.onerror = () => {
      cleanup()
      reject(new Error(`Video decode failed: ${src}`))
    }
    video.src = blobUrl
  })
}

/**
 * Retry a loader function with exponential back-off.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
): Promise<T> {
  let lastErr: unknown
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt)
        console.warn(
          `[useResourceLoader] Retry ${attempt + 1}/${MAX_RETRIES} for ${label} in ${delay}ms`,
        )
        await new Promise((r) => setTimeout(r, delay))
      }
    }
  }
  throw lastErr
}

// ─── Public API ──────────────────────────────────────────────────────

export interface ResourceLoaderOptions {
  /** Image URLs to preload */
  images?: string[]
  /** Video URLs to preload */
  videos?: string[]
}

/**
 * Composable: preloads all listed images & videos.
 *
 * - `isReady` stays `false` until **every** resource has been
 *   downloaded, decoded, and is paint-ready.
 * - Resources are stored as blob:// URLs in a global cache and
 *   **never freed** unless the page is refreshed.
 * - `blobUrls` maps each original URL → its blob URL so that
 *   templates can use the blob URL directly for instant rendering.
 *
 * @example
 * ```ts
 * const { isReady, blobUrls } = useResourceLoader({
 *   images: [logo1, logo2],
 *   videos: [animationMp4],
 * })
 *
 * // In template: <img :src="blobUrls.get(logo1)" />
 * // Or simply keep original src — browser will use HTTP cache.
 * ```
 */
export function useResourceLoader(options: ResourceLoaderOptions) {
  const images = options.images ?? []
  const videos = options.videos ?? []
  const setKey = [...images, ...videos].sort().join('|')

  // If this exact set was already loaded, skip loading phase entirely
  const isReady = ref(loadedSets.has(setKey))

  // Expose a reactive map of original URL → blob URL
  const blobUrls = ref(new Map<string, string>(
    // Pre-fill from global cache for already-loaded sets
    [...images, ...videos]
      .filter((src) => blobCache.has(src))
      .map((src) => [src, blobCache.get(src)!] as [string, string]),
  ))

  onMounted(async () => {
    if (isReady.value) return

    // Load ALL images and videos in parallel with retry logic.
    // We never give up — the spinner keeps spinning until
    // every resource is truly ready.
    const imagePromises = images.map((src) =>
      withRetry(() => loadImage(src), src).then((blobUrl) => {
        blobUrls.value.set(src, blobUrl)
      }),
    )
    const videoPromises = videos.map((src) =>
      withRetry(() => loadVideo(src), src).then((blobUrl) => {
        blobUrls.value.set(src, blobUrl)
      }),
    )

    await Promise.all([...imagePromises, ...videoPromises])

    loadedSets.add(setKey)
    isReady.value = true
  })

  return { isReady, blobUrls }
}
