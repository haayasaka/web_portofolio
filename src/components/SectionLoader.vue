<script setup lang="ts">
defineProps<{
  /** Minimum height to match the section's expected height */
  minHeight?: string
}>()
</script>

<template>
  <div
    class="section-loader"
    :style="{ minHeight: minHeight || '100vh' }"
    role="status"
    aria-label="Loading section"
  >
    <!-- Apple-style spinner -->
    <div class="loader-spinner" aria-hidden="true">
      <div class="spinner-ring" />
    </div>
    <p class="loader-text">Memuat…</p>
  </div>
</template>

<style scoped>
.section-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  background: #000;
  width: 100%;
}

.loader-spinner {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.08);
  border-top-color: rgba(255, 255, 255, 0.55);
  animation: spin 0.85s cubic-bezier(0.37, 0, 0.63, 1) infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loader-text {
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
}
</style>
