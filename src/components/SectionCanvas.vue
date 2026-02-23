<script setup lang="ts">
import { DESIGN_WIDTH } from '@/data/navigation'

const props = defineProps<{
  id: string
  label: string
  designHeight: number
}>()
</script>

<template>
  <section
    :id="props.id"
    :aria-label="props.label"
    class="relative mx-auto w-full max-w-[1280px] overflow-hidden"
    :style="{ aspectRatio: `${DESIGN_WIDTH} / ${props.designHeight}` }"
    tabindex="-1"
  >
    <slot />
  </section>
</template>
