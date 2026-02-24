<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

/* ------------------------------------------------------------------ */
/*  Gather every asset URL the portfolio uses                         */
/*  (excludes only penugasan.mp4 — loaded lazily on its own section)  */
/* ------------------------------------------------------------------ */

// Hero
const heroPhoto = new URL('../../resources/hero/photo.webp', import.meta.url).href

// Profile
const profileImg = new URL('../../resources/images/profile.webp', import.meta.url).href

// Skills
const htmlIcon    = new URL('../../resources/skills/html.svg', import.meta.url).href
const cssIcon     = new URL('../../resources/skills/css.webp', import.meta.url).href
const jsIcon      = new URL('../../resources/skills/js.webp', import.meta.url).href
const figmaIcon   = new URL('../../resources/skills/figma.webp', import.meta.url).href
const arduinoIcon = new URL('../../resources/skills/arduino.webp', import.meta.url).href
const cIcon       = new URL('../../resources/skills/c.webp', import.meta.url).href
const cppIcon     = new URL('../../resources/skills/cpp.webp', import.meta.url).href
const vueIcon     = new URL('../../resources/skills/vue.webp', import.meta.url).href

// Portofolio
const artechImg     = new URL('../../resources/portofolio/artech_logo.svg', import.meta.url).href
const revielioraImg = new URL('../../resources/portofolio/reveliora.svg', import.meta.url).href
const lucyphoraImg  = new URL('../../resources/portofolio/lucyphora.svg', import.meta.url).href
const smarigaImg    = new URL('../../resources/portofolio/smariga.svg', import.meta.url).href
const jtkImg        = new URL('../../resources/portofolio/logo_jtk.svg', import.meta.url).href
const presensiImg   = new URL('../../resources/portofolio/presensi_eskul.svg', import.meta.url).href

// Prestasi
const kmipnLogo      = new URL('../../resources/prestasi/kmipn-logo.webp', import.meta.url).href
const kmipnHackathon = new URL('../../resources/prestasi/kmipn-hackathon.webp', import.meta.url).href
const mapresPhoto    = new URL('../../resources/prestasi/mapres-photo.webp', import.meta.url).href
const arshantaraLogo = new URL('../../resources/prestasi/arshantara-logo.svg', import.meta.url).href
const ictLogo        = new URL('../../resources/prestasi/ict-logo.webp', import.meta.url).href

// Kontak
const gmailIcon    = new URL('../../resources/kontak/gmail.webp', import.meta.url).href
const waIcon       = new URL('../../resources/kontak/whatsapp.webp', import.meta.url).href
const igIcon       = new URL('../../resources/kontak/instagram.webp', import.meta.url).href
const liIcon       = new URL('../../resources/kontak/linkedin.webp', import.meta.url).href

// HeroVideo SVGs
const maskingSrc = new URL('../../resources/herovideo/himakom-masking.svg', import.meta.url).href
const logoSrc    = new URL('../../resources/herovideo/himakom.svg', import.meta.url).href

// Hero Video (animation.mp4)
const heroVideoSrc = new URL('../../resources/video/animation.mp4', import.meta.url).href

// 3D Model
const modelUrl = new URL('../../resources/models/macbookpro.glb', import.meta.url).href

/* ------------------------------------------------------------------ */
/*  Build image + fetch asset lists                                   */
/* ------------------------------------------------------------------ */

const imageAssets: string[] = [
  heroPhoto,
  profileImg,
  // Skills
  htmlIcon, cssIcon, jsIcon, figmaIcon, arduinoIcon, cIcon, cppIcon, vueIcon,
  // Portofolio
  artechImg, revielioraImg, lucyphoraImg, smarigaImg, jtkImg, presensiImg,
  // Prestasi
  kmipnLogo, kmipnHackathon, mapresPhoto, arshantaraLogo, ictLogo,
  // Kontak
  gmailIcon, waIcon, igIcon, liIcon,
  // HeroVideo
  maskingSrc, logoSrc,
]

// Assets that need fetch (binary blobs like .glb and .mp4)
const fetchAssets: string[] = [
  heroVideoSrc,
  modelUrl,
]

const totalAssets = imageAssets.length + fetchAssets.length

/* ------------------------------------------------------------------ */
/*  Reactive state                                                    */
/* ------------------------------------------------------------------ */

const emit = defineEmits<{
  done: []
}>()

const loaded = ref(0)
const isExiting = ref(false)

const progress = computed(() =>
  totalAssets === 0 ? 100 : Math.round((loaded.value / totalAssets) * 100)
)

/* ------------------------------------------------------------------ */
/*  Preload logic                                                     */
/* ------------------------------------------------------------------ */

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => { loaded.value++; resolve() }
    img.onerror = () => { loaded.value++; resolve() } // don't block on error
    img.src = src
  })
}

function preloadFetch(src: string): Promise<void> {
  return fetch(src)
    .then((res) => res.blob())
    .then(() => { loaded.value++ })
    .catch(() => { loaded.value++ })
}

onMounted(async () => {
  const promises: Promise<void>[] = [
    ...imageAssets.map(preloadImage),
    ...fetchAssets.map(preloadFetch),
  ]

  await Promise.all(promises)

  // Small delay so the user sees 100%
  await new Promise((r) => setTimeout(r, 400))

  // Trigger exit animation
  isExiting.value = true

  // Wait for exit animation to finish before emitting "done"
  setTimeout(() => {
    emit('done')
  }, 700) // matches the CSS transition duration
})
</script>

<template>
  <div
    class="loading-screen"
    :class="{ 'loading-screen--exit': isExiting }"
  >
    <!-- Background ambient glow -->
    <div class="loading-bg-glow loading-bg-glow--1"></div>
    <div class="loading-bg-glow loading-bg-glow--2"></div>

    <!-- Center content -->
    <div class="loading-content">
      <!-- Logo / Name -->
      <h1 class="loading-name">
        <span class="loading-name-first">Hafiz</span>
        <span class="loading-name-last">Portfolio</span>
      </h1>

      <!-- Progress bar container -->
      <div class="loading-bar-container">
        <div class="loading-bar-track">
          <div
            class="loading-bar-fill"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
      </div>

      <!-- Percentage -->
      <p class="loading-percentage">{{ progress }}%</p>

      <!-- Status text -->
      <p class="loading-status">
        {{ progress < 100 ? 'Loading resources…' : 'Ready' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
  transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.loading-screen--exit {
  opacity: 0;
  transform: scale(1.05);
  pointer-events: none;
}

/* ---- Ambient background glows ---- */
.loading-bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
  pointer-events: none;
}
.loading-bg-glow--1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #4da8a8 0%, transparent 70%);
  top: -150px;
  right: -100px;
  animation: glowFloat1 6s ease-in-out infinite alternate;
}
.loading-bg-glow--2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #6dbaba 0%, transparent 70%);
  bottom: -100px;
  left: -80px;
  animation: glowFloat2 7s ease-in-out infinite alternate;
}

@keyframes glowFloat1 {
  0%   { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-60px, 40px) scale(1.15); }
}
@keyframes glowFloat2 {
  0%   { transform: translate(0, 0) scale(1); }
  100% { transform: translate(50px, -30px) scale(1.1); }
}

/* ---- Content ---- */
.loading-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* ---- Name / Logo ---- */
.loading-name {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-bottom: 12px;
}

.loading-name-first {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -1px;
  background: linear-gradient(90deg, #ffffff 0%, #b8dede 50%, #4da8a8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: nameShimmer 3s ease-in-out infinite;
  background-size: 200% 100%;
}

.loading-name-last {
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 8px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

@keyframes nameShimmer {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* ---- Progress bar ---- */
.loading-bar-container {
  width: 280px;
}

.loading-bar-track {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.loading-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #4da8a8, #b8dede);
  transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  box-shadow: 0 0 12px rgba(77, 168, 168, 0.5);
}

/* ---- Percentage ---- */
.loading-percentage {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.7);
  font-variant-numeric: tabular-nums;
  margin: 0;
}

/* ---- Status ---- */
.loading-status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 1px;
  margin: 0;
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 1; }
}
</style>
