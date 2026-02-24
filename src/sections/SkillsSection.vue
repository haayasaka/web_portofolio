<script setup lang="ts">
import SectionLoader from '@/components/SectionLoader.vue'
import { useResourceLoader } from '@/composables/useResourceLoader'

// Skill icon paths moved into root resources with normalized names
const htmlIcon = new URL('../../resources/skills/html.svg', import.meta.url).href
const cssIcon = new URL('../../resources/skills/css.webp', import.meta.url).href
const jsIcon = new URL('../../resources/skills/js.webp', import.meta.url).href
const figmaIcon = new URL('../../resources/skills/figma.webp', import.meta.url).href
const arduinoIcon = new URL('../../resources/skills/arduino.webp', import.meta.url).href
const cIcon = new URL('../../resources/skills/c.webp', import.meta.url).href
const cppIcon = new URL('../../resources/skills/cpp.webp', import.meta.url).href
const vueIcon = new URL('../../resources/skills/vue.webp', import.meta.url).href

const skills = [
  { name: 'HTML', icon: htmlIcon },
  { name: 'CSS', icon: cssIcon },
  { name: 'Javascript', icon: jsIcon },
  { name: 'Figma', icon: figmaIcon },
  { name: 'Arduino\nFramework', icon: arduinoIcon },
  { name: 'C', icon: cIcon },
  { name: 'C++', icon: cppIcon },
  { name: 'VueJS', icon: vueIcon },
]

const { isReady } = useResourceLoader({
  images: [htmlIcon, cssIcon, jsIcon, figmaIcon, arduinoIcon, cIcon, cppIcon, vueIcon],
})
</script>

<template>
  <section
    id="skills"
    class="relative w-full bg-black overflow-hidden"
    style="min-height: 100vh;"
    aria-label="Skills Section"
  >
    <!-- Loading state -->
    <SectionLoader v-if="!isReady" />

    <div v-else class="w-full flex flex-col items-center justify-center px-8 pt-[80px] pb-16 section-fade-in" style="min-height: 100vh;">
      <!-- Section Title -->
      <h2 class="text-white text-[52px] md:text-[60px] font-semibold text-center mb-14 tracking-tight">
        Skills &amp; Tech Stack
      </h2>

      <!-- 4x2 Grid of skills -->
      <div class="grid grid-cols-4 gap-x-12 gap-y-16 max-w-[900px] w-full place-items-center">
        <div
          v-for="skill in skills"
          :key="skill.name"
          class="flex flex-col items-center gap-5 group cursor-default"
        >
          <!-- Icon -->
          <div class="w-28 h-28 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_16px_rgba(77,168,168,0.4)]">
            <img
              :src="skill.icon"
              :alt="skill.name"
              class="w-full h-full object-contain"
              draggable="false"
              loading="lazy"
            />
          </div>
          <!-- Name -->
          <p class="text-white text-[18px] font-semibold text-center leading-tight whitespace-pre-line">{{ skill.name }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
