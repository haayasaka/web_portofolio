<script setup lang="ts">
import { computed, ref } from 'vue'
import { DESIGN_WIDTH } from '@/data/navigation'
import type { NavHotspot } from '@/types/spec'

const props = withDefaults(
  defineProps<{
    hotspots: NavHotspot[]
    designHeight: number
    variant?: 'template' | 'hero'
    activeSectionKey?: string | null
    showActiveGlass?: boolean
  }>(),
  {
    variant: 'template',
    activeSectionKey: null,
    showActiveGlass: false,
  },
)

const emit = defineEmits<{
  navigate: [target: string]
  external: [target: string]
}>()

const hoveredKey = ref<string | null>(null)
const focusedKey = ref<string | null>(null)

const visibleGlassHotspot = computed(() => {
  const hovered = props.hotspots.find((h) => h.key === (hoveredKey.value ?? focusedKey.value))
  if (hovered?.glass) return hovered

  if (!props.showActiveGlass || !props.activeSectionKey) return null
  const active = props.hotspots.find((h) => h.key === props.activeSectionKey)
  return active?.glass ? active : null
})

function pctX(value: number) {
  return `${(value / DESIGN_WIDTH) * 100}%`
}

function pctY(value: number) {
  return `${(value / props.designHeight) * 100}%`
}

function rectStyle(rect: { x: number; y: number; width: number; height: number }) {
  return {
    left: pctX(rect.x),
    top: pctY(rect.y),
    width: pctX(rect.width),
    height: pctY(rect.height),
  }
}

function glassStyle(hotspot: NavHotspot) {
  const inset = props.variant === 'hero' ? 6 : 5
  const yInset = props.variant === 'hero' ? 5 : 4
  return rectStyle({
    x: Math.max(0, hotspot.x - inset),
    y: Math.max(0, hotspot.y - yInset),
    width: hotspot.width + inset * 2,
    height: hotspot.height + yInset * 2,
  })
}

function onHotspotClick(hotspot: NavHotspot) {
  if (hotspot.action.kind === 'section') {
    emit('navigate', hotspot.action.target)
    return
  }

  emit('external', hotspot.action.target)
}
</script>

<template>
  <div class="absolute inset-0 z-20">
    <transition name="glass-fade">
      <div
        v-if="visibleGlassHotspot"
        class="pointer-events-none absolute rounded-[999px] border border-white/15 bg-white/8 shadow-glass backdrop-blur-md transition-all duration-300 ease-smooth"
        :class="props.variant === 'hero' ? 'bg-white/10' : ''"
        :style="glassStyle(visibleGlassHotspot)"
      >
        <div class="absolute inset-[1px] rounded-[inherit] bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </transition>

    <button
      v-for="hotspot in props.hotspots"
      :key="hotspot.key"
      type="button"
      class="absolute rounded-[999px] bg-transparent text-transparent outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      :style="rectStyle(hotspot)"
      :aria-label="hotspot.label"
      :title="hotspot.label"
      @click="onHotspotClick(hotspot)"
      @mouseenter="hoveredKey = hotspot.key"
      @mouseleave="hoveredKey = null"
      @focus="focusedKey = hotspot.key"
      @blur="focusedKey = null"
    >
      {{ hotspot.label }}
    </button>
  </div>
</template>

<style scoped>
.glass-fade-enter-active,
.glass-fade-leave-active {
  transition: opacity 180ms ease, transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.glass-fade-enter-from,
.glass-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
