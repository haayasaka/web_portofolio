<script setup lang="ts">
const emit = defineEmits<{
  navigate: [target: string]
}>()

const heroPhoto = new URL('../../resources/hero/photo.webp', import.meta.url).href

const navItems = [
  { label: 'Profil', target: 'profile' },
  { label: 'Prestasi', target: 'prestasi' },
  { label: 'Skills', target: 'skills' },
  { label: 'Penugasan', target: 'penugasan' },
  { label: 'Kontak', target: 'kontak' },
]
</script>

<template>
  <section
    id="hero"
    class="relative w-full bg-black overflow-hidden"
    style="min-height: 100vh;"
    aria-label="Hero Section"
  >
    <!-- Inline header (transparan, bukan fixed) -->
    <header class="relative z-10 w-full h-[65px] flex items-center justify-center">
      <nav class="flex items-center gap-0.5" aria-label="Hero navigation">
        <button
          v-for="item in navItems"
          :key="item.target"
          type="button"
          class="px-3 py-1 text-[14px] font-normal text-white/70 hover:text-white transition-colors duration-200 cursor-pointer outline-none rounded-full"
          :aria-label="`Navigate to ${item.label}`"
          @click="emit('navigate', item.target)"
        >
          {{ item.label }}
        </button>
      </nav>
    </header>

    <!-- Main content -->
    <div class="relative w-full flex items-center" style="height: calc(100vh - 43px);">
      <!-- Left: Text -->
      <div class="flex flex-col justify-center pl-[7.5%]" style="flex: 0 0 56%; max-width: 56%;">
        <p class="text-white text-[22px] font-thin tracking-wide mb-1">Saya</p>
        <h1 class="font-bold leading-none mb-5">
          <span class="hero-name-gradient text-[68px] md:text-[76px] lg:text-[84px] xl:text-[96px] tracking-tight">
            Hafiz Fauzan Syafrudin
          </span>
        </h1>
        <p class="text-white/80 text-[20px] md:text-[22px] font-normal tracking-wide">
          Developer&nbsp;•&nbsp;UI Designer&nbsp;•&nbsp;Informatics Undergraduate
        </p>
      </div>

      <!-- Right: Portrait -->
      <div class="absolute right-0 bottom-0" style="width: 50%; height: 100%;">
        <img
          :src="heroPhoto"
          alt="Hafiz Fauzan Syafrudin"
          class="h-full w-auto object-contain -translate-x-20 object-bottom select-none float-right"
          draggable="false"
          fetchpriority="high"
          loading="eager"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-name-gradient {
  background: linear-gradient(90deg, #ffffff 0%, #b8dede 35%, #6dbaba 65%, #4da8a8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
}
</style>
