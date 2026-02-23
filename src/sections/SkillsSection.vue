<script setup lang="ts">
// Skill icon paths from Specification folder
const htmlIcon = new URL('../../Specification/PAGE_Skills/image 10.svg', import.meta.url).href
const cssIcon = new URL('../../Specification/PAGE_Skills/image 11.png', import.meta.url).href
const jsIcon = new URL('../../Specification/PAGE_Skills/image 15.png', import.meta.url).href
const figmaIcon = new URL('../../Specification/PAGE_Skills/image 16.png', import.meta.url).href
const arduinoIcon = new URL('../../Specification/PAGE_Skills/image 7.png', import.meta.url).href
const cIcon = new URL('../../Specification/PAGE_Skills/image 8.png', import.meta.url).href
const cppIcon = new URL('../../Specification/PAGE_Skills/image 9.png', import.meta.url).href
const vueIcon = new URL('../../Specification/PAGE_Skills/image 14.png', import.meta.url).href

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
</script>

<template>
  <section
    id="skills"
    class="relative w-full bg-black overflow-hidden"
    style="min-height: 100vh;"
    aria-label="Skills Section"
  >
    <div class="w-full flex flex-col items-center justify-center px-8 pt-[80px] pb-16" style="min-height: 100vh;">
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
