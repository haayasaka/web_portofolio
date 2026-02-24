<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue'
import SectionLoader from '@/components/SectionLoader.vue'
import { useResourceLoader } from '@/composables/useResourceLoader'

// ─── Asset URLs ────────────────────────────────────────────────────────────────
const videoSrc    = new URL('../../resources/video/animation.mp4', import.meta.url).href
const maskingSrc  = new URL('../../resources/herovideo/himakom-masking.svg', import.meta.url).href
const logoSrc     = new URL('../../resources/herovideo/himakom.svg', import.meta.url).href

const { isReady: resourcesDownloaded, blobUrls } = useResourceLoader({
  images: [maskingSrc, logoSrc],
  videos: [videoSrc],
})

function resolveUrl(src: string): string {
  return blobUrls.value.get(src) ?? src
}

// ─── Refs ──────────────────────────────────────────────────────────────────────
const outerRef  = ref<HTMLElement | null>(null)
const bgVideo   = ref<HTMLVideoElement | null>(null)
const maskVideo = ref<HTMLVideoElement | null>(null)
let   syncRafId = 0
let   visibilityObserver: IntersectionObserver | null = null

const isPlaybackZoneActive = ref(false)

/**
 * Two-phase readiness:
 *   Phase 1: resourcesDownloaded — blobs are in memory
 *   Phase 2: bgVideoBuffered     — bgVideo has parsed & buffered from blob
 *
 * maskVideo uses the SAME blob URL as bgVideo, so once the blob is
 * proven decodable by bgVideo, maskVideo will buffer instantly from
 * the same in-memory blob when it mounts.
 *
 * Loader stays visible until BOTH phases complete.
 */
const bgVideoReady = ref(false)

/** TRUE only when everything is truly paint-ready */
const sectionReady = computed(() => resourcesDownloaded.value && bgVideoReady.value)

const progress = ref(0)

function onScroll() {
  const el = outerRef.value
  if (!el) return

  const scrolled     = window.scrollY - el.offsetTop
  const totalTravel  = el.offsetHeight - window.innerHeight

  if (scrolled <= 0) {
    progress.value = 0
  } else if (scrolled >= totalTravel) {
    progress.value = 1
  } else {
    progress.value = scrolled / totalTravel
  }
}

// ─── Video sync ───────────────────────────────────────────────────────────
function syncVideoFrames() {
  if (!isPlaybackZoneActive.value) {
    syncRafId = 0
    return
  }

  const src = bgVideo.value
  const dst = maskVideo.value
  if (src && dst && !src.paused) {
    const drift = Math.abs(dst.currentTime - src.currentTime)
    if (drift > 0.033) {
      dst.currentTime = src.currentTime
    }
  }
  syncRafId = requestAnimationFrame(syncVideoFrames)
}

function stopPlaybackAndSync() {
  if (syncRafId) {
    cancelAnimationFrame(syncRafId)
    syncRafId = 0
  }

  bgVideo.value?.pause()
  maskVideo.value?.pause()
}

async function startPlaybackAndSync() {
  if (!isPlaybackZoneActive.value) return
  if (!bgVideo.value || !maskVideo.value) return
  if (!sectionReady.value) return

  await Promise.all([
    bgVideo.value.play().catch(() => {}),
    maskVideo.value.play().catch(() => {}),
  ])

  if (!isPlaybackZoneActive.value || !bgVideo.value || !maskVideo.value) return

  maskVideo.value.currentTime = bgVideo.value.currentTime

  if (!syncRafId) {
    syncRafId = requestAnimationFrame(syncVideoFrames)
  }
}

/**
 * Set blob src on bgVideo and listen for canplaythrough.
 * Called once blob download is complete. bgVideo is ALWAYS in the DOM
 * (behind the loader), so ref is immediately available.
 * maskVideo is inside v-if="sectionReady" — it mounts after bgVideo
 * is ready and gets its src from the same blob URL (instant load).
 */
function initVideoElements() {
  const blobVideoUrl = resolveUrl(videoSrc)

  const bg = bgVideo.value

  if (bg) {
    if (bg.readyState >= 4) {
      bgVideoReady.value = true
    } else {
      bg.oncanplaythrough = () => {
        bgVideoReady.value = true
        bg.oncanplaythrough = null
      }
    }
    bg.preload = 'auto'
    bg.src = blobVideoUrl
    bg.load()
  }
}

// ─── Lifecycle ───────────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  // When resources are downloaded, init video elements immediately
  if (resourcesDownloaded.value) {
    nextTick(() => initVideoElements())
  } else {
    const unwatch = watch(resourcesDownloaded, (ready) => {
      if (ready) {
        unwatch()
        nextTick(() => initVideoElements())
      }
    })
  }

  // When both videos are buffered AND visible, start playback
  watch(sectionReady, (ready) => {
    if (ready && isPlaybackZoneActive.value) {
      void startPlaybackAndSync()
    }
  })

  if (outerRef.value) {
    visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        isPlaybackZoneActive.value = entry.isIntersecting

        if (entry.isIntersecting && sectionReady.value) {
          void startPlaybackAndSync()
        } else if (!entry.isIntersecting) {
          stopPlaybackAndSync()
        }
      },
      {
        root: null,
        rootMargin: '75% 0px',
        threshold: 0,
      },
    )

    visibilityObserver.observe(outerRef.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  visibilityObserver?.disconnect()
  visibilityObserver = null
  stopPlaybackAndSync()
})

// ─── Phase helpers ─────────────────────────────────────────────────────────────

const maskingActive = computed(() => progress.value >= 0.25)

const scaleProgress = computed(() => {
  const p = (progress.value - 0.25) / 0.60
  return Math.max(0, Math.min(1, p))
})

const swapProgress = computed(() => {
  const p = (progress.value - 0.85) / 0.15
  return Math.max(0, Math.min(1, p))
})

// ─── Derived values ────────────────────────────────────────────────────────────

const overlayOpacity = computed(() => maskingActive.value ? 1 : 0)

const maskOpacity = computed(() => {
  if (!maskingActive.value) return 0
  if (progress.value <= 0.85) return 1
  const fadeOutT = Math.min(1, swapProgress.value / 0.9)
  return 1 - fadeOutT
})

const SCALE_MAX = 300.0
const SCALE_MIN = 0.28
const maskScale = computed(() => {
  return SCALE_MAX * Math.pow(SCALE_MIN / SCALE_MAX, scaleProgress.value)
})

const logoOpacity = computed(() => {
  const fadeInT = (swapProgress.value - 0.9) / 0.1
  return Math.max(0, Math.min(1, fadeInT))
})
const logoScale = computed(() => SCALE_MIN)

const videoCounterScale = computed(() => 1 / maskScale.value)

const scrollHintOpacity = computed(() => Math.max(0, 1 - progress.value * 8))
</script>

<template>
  <div
    id="hero-video"
    ref="outerRef"
    style="height: 500vh; background: #000;"
  >
    <div
      class="sticky top-0 overflow-hidden"
      style="height: 100vh; background: #000;"
    >

      <!-- ══════════════════════════════════════════════════════════════════
           Background video — ALWAYS in DOM so it can buffer behind loader.
           src is set via JS in initVideoElements().
      ══════════════════════════════════════════════════════════════════ -->
      <video
        ref="bgVideo"
        class="absolute inset-0 w-full h-full object-cover"
        muted
        loop
        playsinline
        preload="auto"
        style="z-index: 0;"
      />

      <!-- ══════════════════════════════════════════════════════════════════
           Loading overlay — sits ON TOP of everything (z:50).
           Only disappears when blobs downloaded + videos canplaythrough.
      ══════════════════════════════════════════════════════════════════ -->
      <SectionLoader
        v-if="!sectionReady"
        style="position: absolute; inset: 0; z-index: 50;"
      />

      <!-- All visual layers below only mount after sectionReady -->
      <template v-if="sectionReady">

      <!-- Overlay hitam -->
      <div
        class="absolute inset-0"
        style="z-index: 1; background: #000;"
        :style="{ opacity: overlayOpacity }"
      />

      <!-- Mask cutout -->
      <div
        class="absolute inset-0 flex items-center justify-center"
        style="z-index: 2;"
        :style="{
          opacity: maskOpacity,
          transform: `scale(${maskScale})`,
        }"
      >
        <div
          style="
            position: absolute;
            inset: 0;
            mask-repeat: no-repeat;
            -webkit-mask-repeat: no-repeat;
            mask-position: center;
            -webkit-mask-position: center;
            mask-size: contain;
            -webkit-mask-size: contain;
          "
          :style="{
            'mask-image': `url('${resolveUrl(maskingSrc)}')`,
            '-webkit-mask-image': `url('${resolveUrl(maskingSrc)}')`,
          }"
        >
          <!-- Mask video — synced with bgVideo via RAF -->
          <video
            ref="maskVideo"
            muted
            loop
            playsinline
            preload="auto"
            :src="resolveUrl(videoSrc)"
            style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: center;"
            :style="{ transform: `scale(${videoCounterScale})` }"
          />
        </div>
      </div>

      <!-- Logo swap -->
      <div
        class="absolute inset-0 flex items-center justify-center"
        style="z-index: 3; pointer-events: none;"
        :style="{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }"
      >
        <img
          :src="resolveUrl(logoSrc)"
          alt="Himakom Logo"
          class="select-none"
          loading="eager"
          style="
            width: min(100vw, 100vh);
            height: min(100vw, 100vh);
            object-fit: contain;
          "
          draggable="false"
        />
      </div>

      <!-- Scroll hint -->
      <div
        class="absolute bottom-10 left-1/2 flex flex-col items-center gap-2"
        style="z-index: 5; transform: translateX(-50%);"
        :style="{ opacity: scrollHintOpacity }"
      >
        <span style="color: rgba(255,255,255,0.5); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 300;">
          Scroll
        </span>
        <div class="scroll-chevron">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="rgba(255,255,255,0.45)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      </template>
    </div>
  </div>
</template>

<style scoped>
.scroll-chevron {
  animation: bounce-chevron 1.8s ease-in-out infinite;
}
@keyframes bounce-chevron {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(6px); }
}
</style>
