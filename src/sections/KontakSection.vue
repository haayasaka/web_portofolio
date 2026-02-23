<script setup lang="ts">
// Contact icon paths
const gmailIcon = new URL('../../Specification/PAGE_Kontak/image 20.png', import.meta.url).href
const waIcon = new URL('../../Specification/PAGE_Kontak/image 17.png', import.meta.url).href
const igIcon = new URL('../../Specification/PAGE_Kontak/image 18.png', import.meta.url).href
const liIcon = new URL('../../Specification/PAGE_Kontak/image 19.png', import.meta.url).href

const contacts = [
  { icon: gmailIcon, label: 'hafizfs.personal@gmail.com', href: 'mailto:hafizfs.personal@gmail.com', alt: 'Gmail' },
  { icon: igIcon, label: 'instagram.com/hfz_fzan', href: 'https://www.instagram.com/hfz_fzan', alt: 'Instagram' },
  { icon: waIcon, label: 'wa.me/6287770278805', href: 'https://wa.me/6287770278805', alt: 'WhatsApp' },
  { icon: liIcon, label: 'linkedin.com/in/hafiz-fauzan-syafrudin-730a76379/', href: 'https://www.linkedin.com/in/hafiz-fauzan-syafrudin-730a76379/', alt: 'LinkedIn' },
]
</script>

<template>
  <section
    id="kontak"
    class="relative w-full overflow-hidden"
    style="min-height: 100vh; background: #F5F5F7;"
    aria-label="Kontak Section"
  >
    <!-- Content padded for global fixed navbar -->
    <div class="w-full flex items-center px-16 pt-[80px] pb-16" style="min-height: 100vh;">
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
            :src="contact.icon"
            :alt="contact.alt"
            class="w-8 h-8 object-contain flex-shrink-0 transition-opacity duration-200 group-hover:opacity-70"
            draggable="false"
            loading="lazy"
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
