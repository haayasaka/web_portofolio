<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import SectionLoader from '@/components/SectionLoader.vue'
import { useResourceLoader } from '@/composables/useResourceLoader'

// ── Asset paths ──────────────────────────────────────────────────────────────
const artechImg     = new URL('../../resources/portofolio/artech_logo.svg',    import.meta.url).href
const revielioraImg = new URL('../../resources/portofolio/reveliora.svg',       import.meta.url).href
const lucyphoraImg  = new URL('../../resources/portofolio/lucyphora.svg',       import.meta.url).href
const smarigaImg    = new URL('../../resources/portofolio/smariga.svg',         import.meta.url).href
const jtkImg        = new URL('../../resources/portofolio/logo_jtk.svg',        import.meta.url).href
const presensiImg   = new URL('../../resources/portofolio/presensi_eskul.svg',  import.meta.url).href

const { isReady } = useResourceLoader({
  images: [artechImg, revielioraImg, lucyphoraImg, smarigaImg, jtkImg, presensiImg],
})

// ── Portofolio data ──────────────────────────────────────────────────────────
interface PortofolioItem {
  id: string
  image: string
  title: string
  role: string
  description: string
  bgColor: string
}

const items: PortofolioItem[] = [
  {
    id: 'artech',
    image: artechImg,
    title: 'ARTech Mastermind',
    role: 'Hackathon KMIPN VII 2025',
    description:
      'Penggagas awal ide ARTech dalam Hackathon KMIPN VII 2025 yang kemudian memenangkan Juara 2 Kategori Hackathon Tingkat Nasional.',
    bgColor: '#0d0d1a',
  },
  {
    id: 'reveliora',
    image: revielioraImg,
    title: 'SPECTA REVELIORA',
    role: 'Website Co-Author',
    description:
      'Membantu dan menjadi mentor dalam sebuah tim pengembangan website SPECTA REVELIORA SMAN 1 Cianjur.',
    bgColor: '#0a0010',
  },
  {
    id: 'lucyphora',
    image: lucyphoraImg,
    title: 'SPECTA LUCYPHORA',
    role: 'Website Developer',
    description:
      'Menciptakan dan mengembangkan website untuk informasi SPECTA dan pembelian merchandise berbasis website Wordpress.',
    bgColor: '#1c1c1e',
  },
  {
    id: 'smariga',
    image: smarigaImg,
    title: 'SMARIGA (Smart Irrigation System)',
    role: 'Developer',
    description:
      'Merancang dan mengembangkan SMARIGA yang memenangkan Juara Favorit - Voting Terbanyak pada Agrifasco ITB 2024.',
    bgColor: '#0a1a05',
  },
  {
    id: 'jtk25',
    image: jtkImg,
    title: 'JTK25 Active Contributor',
    role: 'App Developer',
    description:
      'Bersama main author Kemal Ardian kami mengembangkan dan me-maintain aplikasi JTK25, yaitu aplikasi jadwal perkuliahan angkatan 2025 mahasiswa JTK.',
    bgColor: '#001020',
  },
  {
    id: 'presensi',
    image: presensiImg,
    title: 'Extracurricular Presence Webapp',
    role: 'Developer',
    description:
      'Merancang, dan menciptakan website untuk presensi kegiatan eskul di SMANSA dan pembuatan laporan otomatis siap cetak.',
    bgColor: '#100010',
  },
]

// Duplicate items for seamless infinite loop
const allItems = computed(() => [...items, ...items, ...items])

// ── Carousel logic ───────────────────────────────────────────────────────────
const wrapperRef = ref<HTMLElement | null>(null)
const sectionRef = ref<HTMLElement | null>(null)
const CARD_W     = 300   // px — card width
const CARD_GAP   = 24    // px — gap between cards
const STEP       = CARD_W + CARD_GAP
const SPEED      = 0.8   // px per frame (~84px/sec at 60fps)

let animId   = 0
let visibilityObserver: IntersectionObserver | null = null
const offsetX   = ref(0)
const isCarouselActive = ref(false)
const prefersReducedMotion = ref(false)

const totalBaseWidth = computed(() => items.length * STEP)

// ── Active (center-highlighted) card ────────────────────────────────────────
const highlightedIndex = ref(0)

/**
 * Recompute which card index (0..items.length-1) is visually
 * closest to the horizontal center of the wrapper.
 * Called every rAF frame so the highlight always follows the scroll.
 */
function updateHighlight() {
  const wrapper = wrapperRef.value
  if (!wrapper) return
  // offsetX is a local translateX inside the wrapper, so the center reference
  // is just half the wrapper's rendered width (local coordinate space).
  const localCenter = wrapper.offsetWidth / 2

  let bestDist = Infinity
  let bestReal = 0
  const n = items.length        // total unique items
  const totalCards = n * 3      // we render 3 copies

  for (let i = 0; i < totalCards; i++) {
    // center of card i in local coords
    const cardCenter = offsetX.value + i * STEP + CARD_W / 2
    const dist = Math.abs(cardCenter - localCenter)
    if (dist < bestDist) {
      bestDist = dist
      bestReal = i % n
    }
  }
  if (bestReal !== highlightedIndex.value) {
    highlightedIndex.value = bestReal
  }
}

function getCardScale(localIndex: number): number {
  const realIndex = localIndex % items.length
  return realIndex === highlightedIndex.value ? 1 : 0.88
}
function getCardOpacity(localIndex: number): number {
  const realIndex = localIndex % items.length
  return realIndex === highlightedIndex.value ? 1 : 0.55
}



function startScroll() {
  if (prefersReducedMotion.value || animId) return

  function loop() {
    if (!isCarouselActive.value) {
      animId = 0
      return
    }

    offsetX.value -= SPEED
    // Seamless infinite loop: once we've scrolled one full set, jump back
    if (Math.abs(offsetX.value) >= totalBaseWidth.value) {
      offsetX.value += totalBaseWidth.value
    }
    updateHighlight()
    animId = requestAnimationFrame(loop)
  }
  animId = requestAnimationFrame(loop)
}

function stopScroll() {
  if (!animId) return
  cancelAnimationFrame(animId)
  animId = 0
}

onMounted(async () => {
  await nextTick()
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Start in the middle copy so both left and right have content
  offsetX.value = -totalBaseWidth.value
  updateHighlight()

  if (sectionRef.value) {
    visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        isCarouselActive.value = entry.isIntersecting
        if (entry.isIntersecting) startScroll()
        else stopScroll()
      },
      {
        root: null,
        rootMargin: '50% 0px',
        threshold: 0,
      },
    )

    visibilityObserver.observe(sectionRef.value)
  }
})

onBeforeUnmount(() => {
  visibilityObserver?.disconnect()
  visibilityObserver = null
  stopScroll()
})
</script>

<template>
  <section
    ref="sectionRef"
    id="portofolio"
    class="relative w-full bg-black overflow-hidden"
    style="min-height: 100vh;"
    aria-label="Portofolio Section"
  >
    <!-- Loading state -->
    <SectionLoader v-if="!isReady" />

    <template v-else>
    <!-- Subtle radial glow behind the carousel -->
    <div class="porto-bg-glow" aria-hidden="true" />

    <div
      class="w-full flex flex-col items-center justify-center pt-[80px] pb-16"
      style="min-height: 100vh;"
    >
      <!-- Section title -->
      <h2 class="porto-title">Portofolio</h2>
      <p class="porto-subtitle">Proyek & karya yang pernah dikerjakan</p>

      <!-- Center highlight zone indicator -->
      <div class="porto-center-zone" aria-hidden="true">
        <span class="porto-center-indicator" />
      </div>

      <!-- ── Horizontal carousel ───────────────────────────────────────── -->
      <div
        ref="wrapperRef"
        class="porto-carousel-wrapper"
        role="list"
        aria-label="Daftar portofolio"
      >
        <!-- Fade masks left / right -->
        <div class="porto-fade-left"  aria-hidden="true" />
        <div class="porto-fade-right" aria-hidden="true" />

        <!-- Scrolling track -->
        <div
          ref="trackRef"
          class="porto-track"
          :style="{ transform: `translateX(${offsetX}px)` }"
        >
          <article
            v-for="(item, idx) in allItems"
            :key="`${item.id}-${idx}`"
            class="porto-card"
            :class="{ 'porto-card--active': (idx % items.length) === highlightedIndex }"
            :style="{
              transform: `scale(${getCardScale(idx)})`,
              opacity: getCardOpacity(idx),
              background: `linear-gradient(160deg, ${item.bgColor} 0%, #000 100%)`,
            }"
            :aria-label="item.title"
            role="listitem"
          >
            <!-- Image area -->
            <div class="porto-card__img-wrap">
              <img
                :src="item.image"
                :alt="item.title"
                class="porto-card__img"
                draggable="false"
                loading="lazy"
                decoding="async"
              />
            </div>

            <!-- Text area -->
            <div class="porto-card__body">
              <p class="porto-card__role">{{ item.role }}</p>
              <h3 class="porto-card__title">{{ item.title }}</h3>
              <p class="porto-card__desc">{{ item.description }}</p>
            </div>
          </article>
        </div>
      </div>

      <!-- Dot indicators -->
      <div class="porto-dots" role="tablist" aria-label="Pilih proyek">
        <button
          v-for="(item, i) in items"
          :key="item.id"
          type="button"
          class="porto-dot"
          :class="{ 'porto-dot--active': i === highlightedIndex }"
          :aria-label="`Proyek ${item.title}`"
          :aria-selected="i === highlightedIndex"
          role="tab"
          @click="highlightedIndex = i"
        />
      </div>
    </div>
    </template>
  </section>
</template>

<style scoped>
/* ── Section background glow ─────────────────────────────────────────── */
.porto-bg-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 60% 45% at 50% 55%,
    rgba(77, 168, 168, 0.07) 0%,
    transparent 70%
  );
}

/* ── Section heading ───────────────────────────────────────────────────── */
.porto-title {
  font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: clamp(40px, 5vw, 60px);
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.03em;
  text-align: center;
  margin: 0 0 12px;
}
.porto-subtitle {
  font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 17px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.01em;
  text-align: center;
  margin: 0 0 48px;
}

/* ── Center-highlight zone pill ───────────────────────────────────────── */
.porto-center-zone {
  position: relative;
  margin-bottom: -28px;   /* overlaps the carousel top */
  z-index: 10;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.porto-center-indicator {
  display: block;
  width: 324px;          /* slightly wider than card */
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, rgba(77,168,168,0.7), transparent);
}

/* ── Carousel wrapper ─────────────────────────────────────────────────── */
.porto-carousel-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  /* tall enough to comfortably fit cards + scale room */
  height: 540px;
  display: flex;
  align-items: center;
}

/* Fade masks */
.porto-fade-left,
.porto-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 200px;
  z-index: 5;
  pointer-events: none;
}
.porto-fade-left {
  left: 0;
  background: linear-gradient(to right, #000 0%, transparent 100%);
}
.porto-fade-right {
  right: 0;
  background: linear-gradient(to left, #000 0%, transparent 100%);
}

/* ── Scrolling track ──────────────────────────────────────────────────── */
.porto-track {
  display: flex;
  align-items: center;
  gap: 24px;
  will-change: transform;
  /* No CSS transition — driven by rAF for smoothness */
}

/* ── Individual card ─────────────────────────────────────────────────── */
.porto-card {
  flex-shrink: 0;
  width: 300px;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  cursor: default;
  transition:
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    opacity  0.55s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.porto-card--active {
  border-color: rgba(77, 168, 168, 0.45);
  box-shadow:
    0 0 0 1px rgba(77, 168, 168, 0.25),
    0 24px 60px rgba(0, 0, 0, 0.55),
    0 0 40px rgba(77, 168, 168, 0.12);
}

/* Image block */
.porto-card__img-wrap {
  width: 100%;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
}
.porto-card__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* subtle drop shadow so SVGs pop on dark bg */
  filter: drop-shadow(0 4px 16px rgba(0,0,0,0.4));
  transition: filter 0.4s ease;
}
.porto-card__img--light {
  /* lucyphora card has light bg so no extra shadow needed */
  filter: none;
}

/* Text block */
.porto-card__body {
  padding: 16px 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.porto-card__role {
  font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #4DA8A8;
  margin: 0;
}
.porto-card__title {
  font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
  margin: 0;
  line-height: 1.25;
}
.porto-card__desc {
  font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin: 4px 0 0;
  /* clamp to 4 lines */
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Dot indicators ──────────────────────────────────────────────────── */
.porto-dots {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 36px;
}
.porto-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.25);
  transition:
    background 0.3s ease,
    transform  0.3s cubic-bezier(0.22, 1, 0.36, 1),
    width      0.3s cubic-bezier(0.22, 1, 0.36, 1);
  outline: none;
  flex-shrink: 0;
}
.porto-dot--active {
  width: 22px;
  border-radius: 3px;
  background: #4DA8A8;
}
.porto-dot:hover:not(.porto-dot--active) {
  background: rgba(255, 255, 255, 0.5);
}
</style>
