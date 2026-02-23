<script setup lang="ts">
import NavHotspotLayer from '@/components/NavHotspotLayer.vue'
import SectionCanvas from '@/components/SectionCanvas.vue'
import type { NavHotspot } from '@/types/spec'

const props = withDefaults(
  defineProps<{
    id: string
    label: string
    svgUrl: string
    designHeight: number
    navHotspots?: NavHotspot[]
    navVariant?: 'template' | 'hero'
    activeSectionKey?: string | null
    eager?: boolean
    showActiveNavGlass?: boolean
  }>(),
  {
    navHotspots: () => [],
    navVariant: 'template',
    activeSectionKey: null,
    eager: false,
    showActiveNavGlass: false,
  },
)

const emit = defineEmits<{
  navigate: [target: string]
  external: [target: string]
}>()
</script>

<template>
  <SectionCanvas :id="props.id" :label="props.label" :design-height="props.designHeight">
    <img
      :src="props.svgUrl"
      :alt="`${props.label} specification`"
      class="block h-full w-full select-none object-cover"
      draggable="false"
      :loading="props.eager ? 'eager' : 'lazy'"
      :fetchpriority="props.eager ? 'high' : 'auto'"
    />

    <NavHotspotLayer
      v-if="props.navHotspots.length"
      :hotspots="props.navHotspots"
      :design-height="props.designHeight"
      :variant="props.navVariant"
      :active-section-key="props.activeSectionKey"
      :show-active-glass="props.showActiveNavGlass"
      @navigate="emit('navigate', $event)"
      @external="emit('external', $event)"
    />

    <slot />
  </SectionCanvas>
</template>
