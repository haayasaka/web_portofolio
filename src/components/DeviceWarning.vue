<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const isUnsupported = ref(false)

function checkDevice() {
  // 1. Check User Agent (Directly identifies mobile hardware)
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  
  // 2. Check for Touch + Small Screen (Even in Desktop Mode, touch points usually remain)
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
  
  // 3. Orientation check
  const isPortrait = window.innerHeight > window.innerWidth

  // The user specifically wants Desktop + Landscape ONLY.
  // We trigger warning if:
  // - Hardware is mobile (isMobileUA)
  // - Screen is portrait (isPortrait)
  // - It's a touch device with small dimensions (Mobile in desktop mode)
  isUnsupported.value = isMobileUA || isPortrait || (isTouchDevice && window.innerWidth < 1024)
}

// Global scroll lock when warning is active
watch(isUnsupported, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  checkDevice()
  window.addEventListener('resize', checkDevice)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkDevice)
  document.body.style.overflow = ''
})
</script>

<template>
  <Transition name="fade">
    <div 
      v-if="isUnsupported" 
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[20px] p-8 text-center"
    >
      <div 
        class="max-w-md w-full p-10 rounded-[32px] bg-black/40 border border-white/10 shadow-2xl space-y-8"
        style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);"
      >
        <!-- Icon section -->
        <div class="flex justify-center">
          <div class="relative">
            <div class="absolute inset-0 bg-white/20 blur-2xl rounded-full"></div>
            <div class="relative w-20 h-20 rounded-[24px] bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center border border-white/20 shadow-inner">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" class="text-white">
                 <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                 <path d="M7 20H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                 <path d="M12 16V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Text content -->
        <div class="space-y-3">
          <h2 class="text-2xl font-bold text-white tracking-tight leading-tight">
            Desktop Landscape Only
          </h2>
          <p class="text-white/50 text-[15px] leading-relaxed font-light">
            Website ini dirancang khusus untuk layar lebar.<br>
            Silakan gunakan perangkat <span class="text-white/80 font-medium">Desktop</span> dengan orientasi <span class="text-white/80 font-medium">Landscape</span> untuk melanjutkan.
          </p>
        </div>

        <!-- Tag -->
        <div class="pt-2">
          <div class="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/10 text-[11px] text-white/40 uppercase tracking-[0.25em] font-medium">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/20 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-white/40"></span>
            </span>
            Premium Experience
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.6s linear;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* Glassmorphism subtle animation */
h2 {
  text-shadow: 0 0 20px rgba(255,255,255,0.1);
}
</style>
