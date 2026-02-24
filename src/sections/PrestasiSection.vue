<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import SectionLoader from '@/components/SectionLoader.vue'
import { useResourceLoader } from '@/composables/useResourceLoader'

const NUM_TABS = 4
const outerRef = ref<HTMLElement | null>(null)
const activeIndex = ref(0)

// Asset paths
const kmipnLogo = new URL('../../resources/prestasi/kmipn-logo.webp', import.meta.url).href
const kmipnHackathon = new URL('../../resources/prestasi/kmipn-hackathon.webp', import.meta.url).href
const mapresPhoto = new URL('../../resources/prestasi/mapres-photo.webp', import.meta.url).href
const arshantaraLogo = new URL('../../resources/prestasi/arshantara-logo.webp', import.meta.url).href
const ictLogo = new URL('../../resources/prestasi/ict-logo.webp', import.meta.url).href

const { isReady, blobUrls } = useResourceLoader({
  images: [kmipnLogo, kmipnHackathon, mapresPhoto, arshantaraLogo, ictLogo],
})

function resolveImg(src: string): string {
  return blobUrls.value.get(src) ?? src
}

function onScroll() {
  const el = outerRef.value
  if (!el) return

  // Berapa piksel sudah discroll sejak awal section ini
  const scrolled = window.scrollY - el.offsetTop

  // Setiap tab punya "jatah" satu viewport height
  const segmentHeight = window.innerHeight
  const idx = Math.floor(scrolled / segmentHeight)

  activeIndex.value = Math.max(0, Math.min(NUM_TABS - 1, idx))
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <!--
    Outer container: tingginya (NUM_TABS + 1) * 100vh
    Padding +1 = supaya ada ruang scroll "masuk" ke section sebelum tab pertama aktif
    dan ruang scroll "keluar" sesudah tab terakhir.
    Inner sticky: tetap di viewport selama user scroll di dalam outer ini.
  -->
  <div
    id="prestasi"
    ref="outerRef"
    :style="`height: ${(NUM_TABS + 1) * 100}vh;`"
  >
    <!-- Loading state -->
    <SectionLoader v-if="!isReady" min-height="100vh" />

    <div
      v-else
      class="sticky top-0 overflow-hidden section-fade-in"
      style="height: 100vh; background: #111111;"
    >
      <!-- Content wrapper padded untuk global navbar -->
      <div class="w-full flex flex-col items-center" style="height: 100%; padding-top: 43px;">
        <!-- Section title -->
        <h2 class="text-white text-[52px] font-semibold tracking-tight mt-8 mb-8 flex-shrink-0">Prestasi</h2>

        <!-- Main card -->
        <div
          class="flex items-stretch rounded-3xl overflow-hidden flex-1"
          style="width: 90vw; background: #000; margin-bottom: 40px;"
        >
          <!-- Left: Tab list -->
          <div class="flex flex-col justify-center gap-3 p-8" style="width: 400px; flex-shrink: 0;">

            <!-- Tab 0: KMIPN -->
            <button
              type="button"
              class="prestasi-tab flex items-center gap-4 text-left cursor-pointer outline-none transition-all duration-300 rounded-[14px]"
              :class="activeIndex === 0 ? 'tab-active' : 'tab-inactive'"
              @click="activeIndex = 0"
            >
              <div class="tab-icon flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center"
                :class="activeIndex === 0 ? 'border-white/60 bg-white/10' : 'border-white/30'">
                <span v-if="activeIndex !== 0" class="text-white/70 text-xl font-light">+</span>
                <div v-else class="w-3 h-3 rounded-full bg-white/70" />
              </div>
              <span class="text-[16px] font-semibold transition-colors duration-300" :class="activeIndex === 0 ? 'text-white' : 'text-white/70'">
                KMIPN VII 2025
              </span>
            </button>

            <!-- Tab 1: MAPRES -->
            <button
              type="button"
              class="prestasi-tab flex items-center gap-4 text-left cursor-pointer outline-none transition-all duration-300 rounded-[14px]"
              :class="activeIndex === 1 ? 'tab-active' : 'tab-inactive'"
              @click="activeIndex = 1"
            >
              <div class="tab-icon flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center"
                :class="activeIndex === 1 ? 'border-white/60 bg-white/10' : 'border-white/30'">
                <span v-if="activeIndex !== 1" class="text-white/70 text-xl font-light">+</span>
                <div v-else class="w-3 h-3 rounded-full bg-white/70" />
              </div>
              <span class="text-[16px] font-medium leading-tight transition-colors duration-300" :class="activeIndex === 1 ? 'text-white' : 'text-white/70'">
                Mahasiswa <span class="text-[#4DA8A8] font-semibold">Berprestasi</span><br/>Polban 2025
              </span>
            </button>

            <!-- Tab 2: LBI -->
            <button
              type="button"
              class="prestasi-tab flex items-center gap-4 text-left cursor-pointer outline-none transition-all duration-300 rounded-[14px]"
              :class="activeIndex === 2 ? 'tab-active' : 'tab-inactive'"
              @click="activeIndex = 2"
            >
              <div class="tab-icon flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center"
                :class="activeIndex === 2 ? 'border-white/60 bg-white/10' : 'border-white/30'">
                <span v-if="activeIndex !== 2" class="text-white/70 text-xl font-light">+</span>
                <div v-else class="w-3 h-3 rounded-full bg-white/70" />
              </div>
              <span class="text-[16px] font-medium leading-tight transition-colors duration-300" :class="activeIndex === 2 ? 'text-white' : 'text-white/70'">
                #1 LBI UTBK-SNBT 2025
              </span>
            </button>

            <!-- Tab 3: Organisasi -->
            <button
              type="button"
              class="prestasi-tab flex items-center gap-4 text-left cursor-pointer outline-none transition-all duration-300 rounded-[14px]"
              :class="activeIndex === 3 ? 'tab-active' : 'tab-inactive'"
              @click="activeIndex = 3"
            >
              <div class="tab-icon flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center"
                :class="activeIndex === 3 ? 'border-white/60 bg-white/10' : 'border-white/30'">
                <span v-if="activeIndex !== 3" class="text-white/70 text-xl font-light">+</span>
                <div v-else class="w-3 h-3 rounded-full bg-white/70" />
              </div>
              <span class="text-[16px] font-medium leading-tight transition-colors duration-300" :class="activeIndex === 3 ? 'text-white' : 'text-white/70'">
                Pengurus <span class="text-[#4DA8A8] font-semibold">Inti</span><br/>Organisasi <span class="text-[#4DA8A8] font-semibold">Sekolah</span>
              </span>
            </button>
          </div>

          <!-- Right: Content panel -->
          <div class="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
            <transition name="prestasi-content" mode="out-in">
              <!-- KMIPN -->
              <div v-if="activeIndex === 0" key="kmipn" class="w-full flex flex-col items-center justify-center gap-6">
                <img :src="resolveImg(kmipnLogo)" alt="KMIPN VII 2025" class="max-h-[200px] object-contain" draggable="false" loading="eager" />
                <img :src="resolveImg(kmipnHackathon)" alt="Kategori Hackathon" class="max-h-[110px] object-contain" draggable="false" loading="eager" />
              </div>

              <!-- Mahasiswa Berprestasi -->
              <div v-else-if="activeIndex === 1" key="mapres" class="w-full flex items-center justify-center">
                <img :src="resolveImg(mapresPhoto)" alt="Mahasiswa Berprestasi Polban 2025" class="max-h-[400px] max-w-full object-contain rounded-lg" draggable="false" loading="eager" />
              </div>

              <!-- LBI -->
              <div v-else-if="activeIndex === 2" key="lbi" class="w-full flex flex-col items-center justify-center gap-5">
                <div class="lbi-score text-[90px] font-bold leading-none">811,68</div>
                <div class="bg-white text-black rounded-xl p-6 max-w-[480px] w-full font-mono text-[13px] leading-relaxed shadow-xl">
                  <p class="font-bold mb-2">Tes Potensi Skolastik (TPS):</p>
                  <div class="flex justify-between pl-4"><span>Penalaran Umum</span><span>746,96</span></div>
                  <div class="flex justify-between pl-4"><span>Pengetahuan dan Pemahaman Umum</span><span>624,21</span></div>
                  <div class="flex justify-between pl-4"><span>Pemahaman Bacaan dan Menulis</span><span>552,95</span></div>
                  <div class="flex justify-between pl-4"><span>Pengetahuan Kuantitatif</span><span>688,73</span></div>
                  <p class="font-bold mt-3 mb-2">Tes Literasi:</p>
                  <div class="flex justify-between pl-4"><span>Literasi dalam Bahasa Indonesia</span><span>811,68</span></div>
                  <div class="flex justify-between pl-4"><span>Literasi dalam Bahasa Inggris</span><span>789,90</span></div>
                  <div class="flex justify-between pl-4"><span>Penalaran Matematika</span><span>543,76</span></div>
                </div>
              </div>

              <!-- Organisasi -->
              <div v-else-if="activeIndex === 3" key="organisasi" class="w-full flex gap-12 items-center justify-center">
                <div class="flex flex-col items-center gap-4">
                  <p class="text-white text-[18px] font-medium text-center">Pengurus <span class="text-[#4DA8A8] font-semibold">Sekbid 9</span></p>
                  <img :src="resolveImg(arshantaraLogo)" alt="Arshantara" class="w-44 h-44 object-contain" draggable="false" loading="eager" />
                </div>
                <div class="flex flex-col items-center gap-4">
                  <p class="text-white text-[18px] font-medium text-center">Ketua Eskul 23/24<br/>ICT Delphi 62</p>
                  <img :src="resolveImg(ictLogo)" alt="ICT" class="w-44 h-44 object-contain" draggable="false" loading="eager" />
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prestasi-tab {
  padding: 14px 18px;
}
.tab-active {
  background: rgba(255, 255, 255, 0.12);
}
.tab-inactive {
  background: rgba(255, 255, 255, 0.06);
}
.tab-inactive:hover {
  background: rgba(255, 255, 255, 0.09);
}
.prestasi-content-enter-active,
.prestasi-content-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.prestasi-content-enter-from { opacity: 0; transform: translateY(12px); }
.prestasi-content-leave-to  { opacity: 0; transform: translateY(-12px); }

.lbi-score {
  background: linear-gradient(90deg, #6dbaba, #4DA8A8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
