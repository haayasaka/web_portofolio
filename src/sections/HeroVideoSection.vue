<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'

// ─── Asset URLs ────────────────────────────────────────────────────────────────
const videoSrc    = new URL('../../resources/video/animation.mp4', import.meta.url).href
const maskingSrc  = new URL('../../resources/herovideo/himakom-masking.svg', import.meta.url).href
const logoSrc     = new URL('../../resources/herovideo/himakom.svg', import.meta.url).href

// ─── Refs ──────────────────────────────────────────────────────────────────────
const outerRef  = ref<HTMLElement | null>(null)
const bgVideo   = ref<HTMLVideoElement | null>(null)
const maskVideo = ref<HTMLVideoElement | null>(null)
let   syncRafId = 0   // RAF id untuk video-frame sync loop
let   visibilityObserver: IntersectionObserver | null = null

const hasActivatedVideoSources = ref(false)
const isPlaybackZoneActive = ref(false)


/**
 * progress: 0 → 1  (total scroll travel di dalam outer)
 *
 * Phase timeline:
 *   0.00 – 0.25 : Video full-screen saja (no mask)
 *   0.25        : Overlay hitam + mask snap muncul (SCALE_MAX = 200)
 *   0.25 – 0.85 : Mask scale-down (Exponential interpolation agar smooth)
 *   0.85 – 1.00 : Swap ke himakom.svg (mask fade-out → logo fade-in)
 */
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
/**
 * Setiap animation frame, sync currentTime maskVideo ke bgVideo.
 * Threshold 1 frame (33ms @ 30fps) sebelum koreksi untuk menghindari
 * micro-jitter tapi tetap responsif terhadap drift.
 */
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

async function ensureVideoSourcesActivated() {
  if (hasActivatedVideoSources.value) return
  hasActivatedVideoSources.value = true
  await nextTick()
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
  await ensureVideoSourcesActivated()

  if (!isPlaybackZoneActive.value) return
  if (!bgVideo.value || !maskVideo.value) return

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

// ─── Lifecycle ───────────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  if (outerRef.value) {
    visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        isPlaybackZoneActive.value = entry.isIntersecting

        if (entry.isIntersecting) {
          void startPlaybackAndSync()
        } else {
          stopPlaybackAndSync()
        }
      },
      {
        // Start loading/playback slightly before the section enters viewport.
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

/** Apakah fase masking sudah aktif (progress >= 0.25) */
const maskingActive = computed(() => progress.value >= 0.25)

/** 0→1 selama fase scale-down (0.25 – 0.85) */
const scaleProgress = computed(() => {
  const p = (progress.value - 0.25) / 0.60
  return Math.max(0, Math.min(1, p))
})

/** 0→1 selama fase swap logo (0.85 – 1.00) */
const swapProgress = computed(() => {
  const p = (progress.value - 0.85) / 0.15
  return Math.max(0, Math.min(1, p))
})

// ─── Derived values ────────────────────────────────────────────────────────────

/** Overlay hitam: snap ke 1 saat masking aktif (progress >= 0.25) */
const overlayOpacity = computed(() => maskingActive.value ? 1 : 0)

/**
 * Mask (cutout) opacity:
 *   - Snap ke 1 saat progress >= 0.50 (no fade-in)
 *   - Full selama scale-down (0.50 – 0.85)
 *   - Fade-out di fase swap: hilang selama 90% pertama swap progress
 */
const maskOpacity = computed(() => {
  if (!maskingActive.value) return 0
  if (progress.value <= 0.85) return 1
  // Swap phase: mask fade-out selama 0→90% swap progress
  const fadeOutT = Math.min(1, swapProgress.value / 0.9)
  return 1 - fadeOutT
})

/**
 * SCALE_MAX harus cukup besar sehingga saat mask pertama muncul (progress=0.25)
 * seluruh viewport tertutup oleh mask — tidak ada visual "snap/jump".
 * Efeknya: mask terasa sudah ada sejak awal, lalu mengecil seiring scroll.
 */
const SCALE_MAX = 300.0
const SCALE_MIN = 0.28
const maskScale = computed(() => {
  /**
   * Menggunakan Power / Exponential interpolation (Math.pow).
   * Dengan SCALE_MAX ekstrim (200), linear interpolation akan terasa sangat 
   * lambat di awal dan sangat cepat "snap" di akhir.
   * Math.pow memastikan kecepatan visual pengecilan terasa konstan/smooth.
   */
  return SCALE_MAX * Math.pow(SCALE_MIN / SCALE_MAX, scaleProgress.value)
})

/**
 * Logo asli:
 *   - Opacity: mulai fade-in hanya setelah 90% swap (mask sudah hampir hilang)
 *   - Scale: TETAP di SCALE_MIN (sama persis ukuran mask di akhir, tidak membesar)
 */
const logoOpacity = computed(() => {
  // Hanya muncul setelah 90% swap progress
  const fadeInT = (swapProgress.value - 0.9) / 0.1
  return Math.max(0, Math.min(1, fadeInT))
})
const logoScale = computed(() => SCALE_MIN)

/**
 * Counter-scale untuk video di dalam mask:
 * Karena parent di-scale(maskScale), video perlu scale(1/maskScale)
 * agar tampil tetap full-screen (efek net: maskScale × 1/maskScale = 1).
 */
const videoCounterScale = computed(() => 1 / maskScale.value)

/** Scroll hint: hilang saat mulai scroll */
const scrollHintOpacity = computed(() => Math.max(0, 1 - progress.value * 8))
</script>

<template>
  <!--
    Outer: 5× viewport height → cukup ruang scroll untuk:
      - 50% = fase video full-screen
      - 50% = fase masking animasi
    Inner: sticky, tetap di viewport selama user ada di dalam outer.
  -->
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
           LAYER 1 (z:0) — Background video full-screen (selalu main)
           Tampil sejak awal masuk section, sebelum masking muncul.
      ══════════════════════════════════════════════════════════════════ -->
      <video
        ref="bgVideo"
        class="absolute inset-0 w-full h-full object-cover"
        muted
        loop
        playsinline
        preload="metadata"
        :src="hasActivatedVideoSources ? videoSrc : undefined"
        style="z-index: 0;"
      />

      <!-- ══════════════════════════════════════════════════════════════════
           LAYER 2 (z:1) — Overlay hitam
           Muncul saat fase masking dimulai (progress ≥ 0.50).
           Menutup background video sehingga hanya cutout logo yang kelihatan.
      ══════════════════════════════════════════════════════════════════ -->
      <div
        class="absolute inset-0"
        style="z-index: 1; background: #000;"
        :style="{ opacity: overlayOpacity }"
      />

      <!-- ══════════════════════════════════════════════════════════════════
           LAYER 3 (z:2) — Mask cutout (video terlihat hanya lewat logo)
           Muncul bersamaan dengan overlay. Scale-down seiring scroll.
      ══════════════════════════════════════════════════════════════════ -->
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
            'mask-image': `url('${maskingSrc}')`,
            '-webkit-mask-image': `url('${maskingSrc}')`,
          }"
        >
          <!-- Clone video untuk di-mask (wajib terpisah dari bg video) -->
          <!--
            Counter-scale: video di-scale kebalikan dari parent mask
            → video SELALU penuh layar, hanya shape mask-nya yang mengecil.
          -->
          <video
            ref="maskVideo"
            muted
            loop
            playsinline
            preload="none"
            :src="hasActivatedVideoSources ? videoSrc : undefined"
            style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: center;"
            :style="{ transform: `scale(${videoCounterScale})` }"
          />
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           LAYER 4 (z:3) — Logo swap (himakom.svg asli, fase akhir)
      ══════════════════════════════════════════════════════════════════ -->
      <div
        class="absolute inset-0 flex items-center justify-center"
        style="z-index: 3; pointer-events: none;"
        :style="{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }"
      >
        <img
          :src="logoSrc"
          alt="Himakom Logo"
          class="select-none"
          loading="lazy"
          decoding="async"
          style="
            width: min(100vw, 100vh);
            height: min(100vw, 100vh);
            object-fit: contain;
          "
          draggable="false"
        />
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           Scroll hint (hilang saat mulai scroll)
      ══════════════════════════════════════════════════════════════════ -->
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
