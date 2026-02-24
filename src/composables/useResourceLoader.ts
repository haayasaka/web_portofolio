import { ref, onMounted } from 'vue'

/**
 * Resource cache — persisted for the entire page lifetime.
 * Resources are NEVER freed unless the user refreshes the page.
 * Keys: resource URL → loaded HTMLImageElement or HTMLVideoElement.
 */
const imageCache = new Map<string, HTMLImageElement>()
const videoCache = new Map<string, HTMLVideoElement>()

/**
 * Track which resource sets have already been fully loaded.
 * Prevents re-triggering loading for the same set of resources.
 */
const loadedSets = new Set<string>()

function loadImage(src: string): Promise<HTMLImageElement> {
  // Return cached image if available
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

function loadVideo(src: string): Promise<HTMLVideoElement> {
  // Return cached video if available
  if (videoCache.has(src)) {
    return Promise.resolve(videoCache.get(src)!)
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true

    video.oncanplaythrough = () => {
      videoCache.set(src, video)
      resolve(video)
    }
    video.onerror = () => reject(new Error(`Failed to load video: ${src}`))
    video.src = src
  })
}

export interface ResourceLoaderOptions {
  /** Image URLs to preload */
  images?: string[]
  /** Video URLs to preload */
  videos?: string[]
}

/**
 * Composable: preloads all listed images & videos.
 *
 * - `isReady` stays `false` until every resource has loaded.
 * - Resources are cached globally and never freed (per user requirement).
 * - If the exact same resource set was already loaded, `isReady` starts as `true`.
 *
 * @example
 * ```ts
 * const { isReady } = useResourceLoader({
 *   images: [logo1, logo2, logo3],
 *   videos: [animationMp4],
 * })
 * ```
 */
export function useResourceLoader(options: ResourceLoaderOptions) {
  const images = options.images ?? []
  const videos = options.videos ?? []
  const setKey = [...images, ...videos].sort().join('|')

  // If this exact set was already loaded, skip loading phase entirely
  const isReady = ref(loadedSets.has(setKey))

  onMounted(async () => {
    if (isReady.value) return

    try {
      const imagePromises = images.map((src) => loadImage(src))
      const videoPromises = videos.map((src) => loadVideo(src))

      await Promise.all([...imagePromises, ...videoPromises])

      loadedSets.add(setKey)
      isReady.value = true
    } catch (err) {
      // Even on partial failure, show the section to avoid permanent loading state.
      // Resources that did load are still cached.
      console.warn('[useResourceLoader] Some resources failed to load:', err)
      loadedSets.add(setKey)
      isReady.value = true
    }
  })

  return { isReady }
}
