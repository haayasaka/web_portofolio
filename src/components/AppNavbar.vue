<script setup lang="ts">
const props = defineProps<{
  activeSectionKey?: string | null
}>()

const emit = defineEmits<{
  navigate: [target: string]
  external: [url: string]
}>()

const navItems = [
  { key: 'profile',    label: 'Profil',     target: 'profile' },
  { key: 'prestasi',   label: 'Prestasi',   target: 'prestasi' },
  { key: 'skills',     label: 'Skills',     target: 'skills' },
  { key: 'hero-video', label: 'Penugasan',  target: 'hero-video' },
  { key: 'kontak',     label: 'Kontak',     target: 'kontak' },
]

function navigateTo(target: string) {
  emit('navigate', target)
}

function openLinkedIn() {
  emit('external', 'https://www.linkedin.com/in/hafiz-fauzan-syafrudin-730a76379/')
}
</script>

<template>
  <nav
    class="liquid-glass-nav fixed top-0 left-0 right-0 z-50 h-[56px] flex items-center justify-between px-6"
    role="navigation"
    aria-label="Main navigation"
  >
    <!-- Left spacer -->
    <div class="flex-1" />

    <!-- Center: Nav links + LinkedIn -->
    <div class="flex items-center gap-0.5">
      <button
        v-for="item in navItems"
        :key="item.key"
        type="button"
        :id="`nav-${item.key}`"
        class="px-3 py-1 text-[14px] font-normal cursor-pointer outline-none transition-colors duration-200 rounded-full"
        :class="activeSectionKey === item.key ? 'text-white' : 'text-white/60 hover:text-white/90'"
        :aria-label="`Navigate to ${item.label}`"
        :aria-current="activeSectionKey === item.key ? 'page' : undefined"
        @click="navigateTo(item.target)"
      >
        {{ item.label }}
      </button>

      <!-- LinkedIn button, setelah Kontak -->
      <button
        id="nav-linkedin"
        type="button"
        class="ml-2 px-4 py-[5px] rounded-full text-[13px] font-medium text-white cursor-pointer transition-all duration-200 hover:brightness-110 active:brightness-90 outline-none"
        style="background: #0077B5;"
        aria-label="Open LinkedIn Profile"
        @click="openLinkedIn"
      >
        LinkedIn
      </button>
    </div>

    <!-- Right spacer -->
    <div class="flex-1" />
  </nav>
</template>
