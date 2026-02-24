<script setup lang="ts">
import SectionLoader from '@/components/SectionLoader.vue'
import { useResourceLoader } from '@/composables/useResourceLoader'

// Contact icon paths
const gmailIcon = new URL('../../resources/kontak/gmail.webp', import.meta.url).href
const waIcon = new URL('../../resources/kontak/whatsapp.webp', import.meta.url).href
const igIcon = new URL('../../resources/kontak/instagram.webp', import.meta.url).href
const liIcon = new URL('../../resources/kontak/linkedin.webp', import.meta.url).href

const contacts = [
  { icon: gmailIcon, label: 'hafizfs.personal@gmail.com', href: 'mailto:hafizfs.personal@gmail.com', alt: 'Gmail' },
  { icon: igIcon, label: 'instagram.com/hfz_fzan', href: 'https://www.instagram.com/hfz_fzan', alt: 'Instagram' },
  { icon: waIcon, label: 'wa.me/6287770278805', href: 'https://wa.me/6287770278805', alt: 'WhatsApp' },
  { icon: liIcon, label: 'linkedin.com/in/hafiz-fauzan-syafrudin-730a76379/', href: 'https://www.linkedin.com/in/hafiz-fauzan-syafrudin-730a76379/', alt: 'LinkedIn' },
]

const { isReady, blobUrls } = useResourceLoader({
  images: [gmailIcon, waIcon, igIcon, liIcon],
})

function resolveIcon(src: string): string {
  return blobUrls.value.get(src) ?? src
}
</script>

<template>
  <section
    id="kontak"
    class="relative w-full overflow-hidden"
    style="min-height: 100vh; background: #F5F5F7;"
    aria-label="Kontak Section"
  >
    <!-- Loading state (light bg to match section) -->
    <div v-if="!isReady" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 18px;">
      <div style="width: 36px; height: 36px;">
        <div style="width: 36px; height: 36px; border-radius: 50%; border: 3px solid rgba(0,0,0,0.08); border-top-color: rgba(0,0,0,0.45); animation: spin 0.85s cubic-bezier(0.37,0,0.63,1) infinite;" />
      </div>
      <p style="font-size: 13px; color: rgba(0,0,0,0.35); margin: 0; letter-spacing: 0.04em;">Memuat…</p>
    </div>

    <!-- Content padded for global fixed navbar -->
    <div v-else class="w-full flex items-center px-16 pt-[80px] pb-16 section-fade-in" style="min-height: 100vh;">
      <!-- Left: Big title -->
      <div class="flex-shrink-0 mr-24">
        <h2 class="font-bold tracking-tight" style="font-size: 80px; line-height: 1; color: #1D1D1F;">Kontak</h2>
      </div>

      <!-- Right: Contact list -->
      <div class="flex-1 grid grid-cols-2 gap-x-16 gap-y-6">
        <a
          v-for="contact in contacts"
          :key="contact.alt"
          :href="contact.href"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-4 group"
          :aria-label="contact.alt"
        >
          <img
            :src="resolveIcon(contact.icon)"
            :alt="contact.alt"
            class="w-8 h-8 object-contain flex-shrink-0 transition-opacity duration-200 group-hover:opacity-70"
            draggable="false"
            loading="eager"
          />
          <span
            class="underline text-[16px] font-normal transition-opacity duration-200 group-hover:opacity-70"
            style="color: #1D1D1F;"
          >
            {{ contact.label }}
          </span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
