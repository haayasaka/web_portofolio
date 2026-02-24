<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import HeroSection from '@/sections/HeroSection.vue'
import ProfileSection from '@/sections/ProfileSection.vue'
import PrestasiSection from '@/sections/PrestasiSection.vue'
import SkillsSection from '@/sections/SkillsSection.vue'
import PortofolioSection from '@/sections/PortofolioSection.vue'
import HeroVideoSection from '@/sections/HeroVideoSection.vue'
import PenugasanSection from '@/sections/PenugasanSection.vue'
import KontakSection from '@/sections/KontakSection.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import DeviceWarning from '@/components/DeviceWarning.vue'

type SectionId = 'hero' | 'profile' | 'prestasi' | 'skills' | 'portofolio' | 'hero-video' | 'penugasan' | 'kontak'

const activeSectionKey = ref<SectionId>('hero')

const sectionOrder: SectionId[] = [
  'hero',
  'profile',
  'prestasi',
  'skills',
  'portofolio',
  'hero-video',
  'penugasan',
  'kontak',
]

let rafId = 0

function getSectionElement(id: SectionId) {
  return document.getElementById(id)
}

function updateActiveSection() {
  rafId = 0

  const viewportProbe = window.scrollY + window.innerHeight * 0.25
  let nextActive = sectionOrder[0]
  let bestDistance = Number.POSITIVE_INFINITY

  for (const id of sectionOrder) {
    const element = getSectionElement(id)
    if (!element) continue

    const top = element.offsetTop
    const bottom = top + element.offsetHeight
    const inside = viewportProbe >= top && viewportProbe < bottom

    if (inside) {
      nextActive = id
      bestDistance = 0
      break
    }

    const distance = Math.abs(top - viewportProbe)
    if (distance < bestDistance) {
      bestDistance = distance
      nextActive = id
    }
  }

  activeSectionKey.value = nextActive
}

function onScroll() {
  if (rafId) return
  rafId = requestAnimationFrame(updateActiveSection)
}

function navigateTo(target: string) {
  const el = document.getElementById(target)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  updateActiveSection()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <!-- Global Device & Orientation Warning -->
  <DeviceWarning />

  <!-- Global fixed navbar dengan slide-down/up animation -->
  <Transition name="navbar-slide">
    <AppNavbar
      v-if="activeSectionKey !== 'hero'"
      :active-section-key="activeSectionKey"
      @navigate="navigateTo"
      @external="openExternal"
    />
  </Transition>

  <main>
    <HeroSection @navigate="navigateTo" />
    <ProfileSection />
    <PrestasiSection />
    <SkillsSection />
    <PortofolioSection />
    <HeroVideoSection />
    <PenugasanSection />
    <KontakSection />
  </main>
</template>

<style>
.navbar-slide-enter-active {
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.navbar-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.55, 0, 1, 0.45);
}
.navbar-slide-enter-from,
.navbar-slide-leave-to {
  transform: translateY(-100%);
}
</style>
