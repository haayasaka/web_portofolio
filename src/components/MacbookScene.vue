<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import SectionLoader from '@/components/SectionLoader.vue'

const props = defineProps<{
  videoSrc: string
}>()

const containerRef = ref<HTMLElement | null>(null)

const progress = ref(0)
const isMuted = ref(true)
const isVideoPrimed = ref(false)
const isModelReady = ref(false)
const isRebuffering = ref(false)
const videoDuration = ref(0)
const bufferedAheadSeconds = ref(0)

const modelUrl = new URL('../../resources/models/macbookpro.glb', import.meta.url).href
const MIN_BUFFER_SECONDS_BEFORE_RENDER = 5
const VIDEO_PLAY_START_PROGRESS = 0.45
const REBUFFER_ENTER_THRESHOLD_SECONDS = 0.5
const REBUFFER_RESUME_THRESHOLD_SECONDS = 3
const CAMERA_REFIT_PROGRESS_EPSILON = 0.002

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let macbookGroup: THREE.Group | null = null
let lidNode: THREE.Object3D | null = null
let videoEl: HTMLVideoElement | null = null
let videoTexture: THREE.VideoTexture | null = null
let rafId = 0
let isUnmounted = false
let videoPrimePromise: Promise<void> | null = null
let cleanupVideoPrimeListeners: (() => void) | null = null
let cleanupVideoRuntimeListeners: (() => void) | null = null
let lastUploadedVideoTime = -1
let lastCameraRefitProgress = Number.NaN

const LID_CLOSED_QUAT = new THREE.Quaternion(0, 0, 0, 1)
const LID_OPEN_QUAT = new THREE.Quaternion(-0.7660, 0, 0, 0.6428)
const lidQuatScratch = new THREE.Quaternion()
const framingBox = new THREE.Box3()
const framingCenter = new THREE.Vector3()
const framingSize = new THREE.Vector3()

const isSceneReady = computed(() => isVideoPrimed.value && isModelReady.value)
const minBufferTargetSeconds = computed(() => {
  if (!Number.isFinite(videoDuration.value) || videoDuration.value <= 0) {
    return MIN_BUFFER_SECONDS_BEFORE_RENDER
  }
  return Math.min(MIN_BUFFER_SECONDS_BEFORE_RENDER, Math.max(1, videoDuration.value - 0.25))
})
const bufferedPreviewLabel = computed(() => {
  const buffered = Math.min(bufferedAheadSeconds.value, minBufferTargetSeconds.value)
  return `${buffered.toFixed(1)} / ${minBufferTargetSeconds.value.toFixed(0)}s`
})

function onScroll() {
  const el = containerRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const totalTravel = el.offsetHeight - window.innerHeight
  const scrolled = -rect.top
  if (scrolled <= 0) progress.value = 0
  else if (scrolled >= totalTravel) progress.value = 1
  else progress.value = scrolled / totalTravel
}

function getBufferedAhead(video: HTMLVideoElement): number {
  const { buffered, currentTime } = video
  if (!buffered.length) return 0

  let furthestEnd = 0
  for (let i = 0; i < buffered.length; i++) {
    furthestEnd = Math.max(furthestEnd, buffered.end(i))
  }

  return Math.max(0, furthestEnd - currentTime)
}

function refreshBufferedMetrics(video: HTMLVideoElement) {
  if (Number.isFinite(video.duration) && video.duration > 0) {
    videoDuration.value = video.duration
  }

  bufferedAheadSeconds.value = getBufferedAhead(video)
}

function enterRebuffering() {
  if (isRebuffering.value) return
  isRebuffering.value = true
  videoEl?.pause()
}

function tryResumeFromRebuffer(video: HTMLVideoElement) {
  if (!isRebuffering.value) return

  const resumeTarget = Math.min(REBUFFER_RESUME_THRESHOLD_SECONDS, minBufferTargetSeconds.value)
  const hasEnoughBuffered = bufferedAheadSeconds.value >= resumeTarget
  const canPlay = video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA

  if (!hasEnoughBuffered || !canPlay) return

  isRebuffering.value = false
  if (progress.value > VIDEO_PLAY_START_PROGRESS) {
    video.play().catch(() => {})
  }
}

function attachRuntimeVideoListeners(video: HTMLVideoElement) {
  if (cleanupVideoRuntimeListeners) return

  const onBufferUpdate = () => {
    refreshBufferedMetrics(video)
    tryResumeFromRebuffer(video)
  }

  const onWaitingLike = () => {
    refreshBufferedMetrics(video)

    if (
      isSceneReady.value &&
      progress.value > VIDEO_PLAY_START_PROGRESS &&
      bufferedAheadSeconds.value <= REBUFFER_ENTER_THRESHOLD_SECONDS
    ) {
      enterRebuffering()
    }
  }

  const onPlaying = () => {
    refreshBufferedMetrics(video)
    if (bufferedAheadSeconds.value > REBUFFER_ENTER_THRESHOLD_SECONDS) {
      isRebuffering.value = false
    }
  }

  video.addEventListener('progress', onBufferUpdate)
  video.addEventListener('canplay', onBufferUpdate)
  video.addEventListener('canplaythrough', onBufferUpdate)
  video.addEventListener('loadedmetadata', onBufferUpdate)
  video.addEventListener('loadeddata', onBufferUpdate)
  video.addEventListener('timeupdate', onBufferUpdate)
  video.addEventListener('waiting', onWaitingLike)
  video.addEventListener('stalled', onWaitingLike)
  video.addEventListener('suspend', onWaitingLike)
  video.addEventListener('playing', onPlaying)

  cleanupVideoRuntimeListeners = () => {
    video.removeEventListener('progress', onBufferUpdate)
    video.removeEventListener('canplay', onBufferUpdate)
    video.removeEventListener('canplaythrough', onBufferUpdate)
    video.removeEventListener('loadedmetadata', onBufferUpdate)
    video.removeEventListener('loadeddata', onBufferUpdate)
    video.removeEventListener('timeupdate', onBufferUpdate)
    video.removeEventListener('waiting', onWaitingLike)
    video.removeEventListener('stalled', onWaitingLike)
    video.removeEventListener('suspend', onWaitingLike)
    video.removeEventListener('playing', onPlaying)
    cleanupVideoRuntimeListeners = null
  }
}

function ensureVideoElement(): HTMLVideoElement {
  if (videoEl) return videoEl

  const el = document.createElement('video')
  el.crossOrigin = 'anonymous'
  el.preload = 'auto'
  el.loop = true
  el.muted = true
  el.playsInline = true
  el.autoplay = false
  el.style.display = 'none'
  el.setAttribute('playsinline', '')
  el.setAttribute('webkit-playsinline', '')
  el.disableRemotePlayback = true
  el.src = props.videoSrc

  document.body.appendChild(el)
  videoEl = el
  attachRuntimeVideoListeners(el)
  return el
}

function primeVideoForRender(): Promise<void> {
  if (isVideoPrimed.value) return Promise.resolve()
  if (videoPrimePromise) return videoPrimePromise

  videoPrimePromise = new Promise<void>((resolve, reject) => {
    const el = ensureVideoElement()
    let settled = false

    const cleanup = () => {
      cleanupVideoPrimeListeners = null
      el.removeEventListener('loadedmetadata', onStateChange)
      el.removeEventListener('loadeddata', onStateChange)
      el.removeEventListener('canplay', onStateChange)
      el.removeEventListener('canplaythrough', onStateChange)
      el.removeEventListener('progress', onStateChange)
      el.removeEventListener('suspend', onStateChange)
      el.removeEventListener('stalled', onStateChange)
      el.removeEventListener('waiting', onStateChange)
      el.removeEventListener('error', onError)
    }

    const finish = () => {
      if (settled) return
      settled = true
      isVideoPrimed.value = true
      cleanup()
      resolve()
    }

    const fail = (reason?: unknown) => {
      if (settled) return
      settled = true
      cleanup()
      reject(reason instanceof Error ? reason : new Error('Failed to prime video'))
    }

    const onStateChange = () => {
      refreshBufferedMetrics(el)
      const isPlayable = el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
      const hasEnoughBufferedData = bufferedAheadSeconds.value >= minBufferTargetSeconds.value

      if (isPlayable && hasEnoughBufferedData) {
        finish()
      }
    }

    const onError = () => {
      console.error('[MacbookScene] Failed to load video source:', props.videoSrc)
      fail(new Error(`Video load error: ${props.videoSrc}`))
    }

    cleanupVideoPrimeListeners = cleanup

    el.addEventListener('loadedmetadata', onStateChange)
    el.addEventListener('loadeddata', onStateChange)
    el.addEventListener('canplay', onStateChange)
    el.addEventListener('canplaythrough', onStateChange)
    el.addEventListener('progress', onStateChange)
    el.addEventListener('suspend', onStateChange)
    el.addEventListener('stalled', onStateChange)
    el.addEventListener('waiting', onStateChange)
    el.addEventListener('error', onError)

    onStateChange()
    el.load()
  }).finally(() => {
    videoPrimePromise = null
  })

  return videoPrimePromise
}

function createVideoTexture(): THREE.VideoTexture {
  if (!videoEl) {
    throw new Error('Video element has not been initialized')
  }

  videoTexture = new THREE.VideoTexture(videoEl)
  videoTexture.colorSpace = THREE.SRGBColorSpace
  videoTexture.minFilter = THREE.LinearFilter
  videoTexture.magFilter = THREE.LinearFilter
  videoTexture.generateMipmaps = false
  videoTexture.flipY = false

  return videoTexture
}

function updateCameraFraming(force = false) {
  if (!camera || !macbookGroup) return
  if (
    !force &&
    Number.isFinite(lastCameraRefitProgress) &&
    Math.abs(progress.value - lastCameraRefitProgress) < CAMERA_REFIT_PROGRESS_EPSILON
  ) {
    return
  }

  lastCameraRefitProgress = progress.value

  framingBox.setFromObject(macbookGroup)
  framingBox.getCenter(framingCenter)
  framingBox.getSize(framingSize)

  const maxDim = Math.max(framingSize.x, framingSize.y, framingSize.z)
  const fov = camera.fov * (Math.PI / 180)
  const dist = (maxDim / 2) / Math.tan(fov / 2) * 0.92
  camera.position.set(framingCenter.x, framingCenter.y + 0.15, Math.max(dist, 3.8))
  camera.lookAt(framingCenter.x, framingCenter.y, framingCenter.z)
}

function initScene() {
  const container = containerRef.value
  if (!container || renderer || !videoEl) return

  const stickyEl = container.querySelector('.macbook-sticky') as HTMLElement | null
  if (!stickyEl) return

  const width = stickyEl.clientWidth
  const height = stickyEl.clientHeight

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.4
  stickyEl.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  scene.background = null

  camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100)
  camera.position.set(0, 3, 10)

  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const key = new THREE.DirectionalLight(0xffffff, 1.5)
  key.position.set(5, 5, 5)
  scene.add(key)

  const vTex = createVideoTexture()

  const loader = new GLTFLoader()
  loader.load(modelUrl, (gltf) => {
    if (isUnmounted || !scene) return

    const model = gltf.scene
    macbookGroup = new THREE.Group()

    model.traverse((child) => {
      if (child.name === 'Macbook_lid') lidNode = child
      if (child.name === 'Macbook_screen_surface' && (child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh

        // Planar UV projection fix for the MacBook screen geometry.
        const geo = mesh.geometry
        geo.computeBoundingBox()
        const box = geo.boundingBox!
        const pos = geo.attributes.position
        const uv = new Float32Array(pos.count * 2)

        for (let i = 0; i < pos.count; i++) {
          const px = pos.getX(i)
          const py = pos.getY(i)
          uv[i * 2] = (px - box.min.x) / (box.max.x - box.min.x)
          uv[i * 2 + 1] = 1.0 - ((py - box.min.y) / (box.max.y - box.min.y))
        }

        geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
        geo.attributes.uv.needsUpdate = true

        const screenMat = new THREE.MeshBasicMaterial({ map: vTex })
        screenMat.toneMapped = false
        mesh.material = screenMat
      }
    })

    if (lidNode) lidNode.quaternion.copy(LID_CLOSED_QUAT)
    macbookGroup.add(model)
    scene.add(macbookGroup)
    isModelReady.value = true
    updateCameraFraming(true)

    animate()
  })
}

function animate() {
  rafId = requestAnimationFrame(animate)
  if (!renderer || !scene || !camera || !macbookGroup) return

  if (lidNode) {
    const t = Math.min(1, progress.value / 0.5)
    const eased = 1 - Math.pow(1 - t, 3)
    lidQuatScratch.slerpQuaternions(LID_CLOSED_QUAT, LID_OPEN_QUAT, eased)
    lidNode.quaternion.copy(lidQuatScratch)
  }

  if (videoEl && videoTexture) {
    if (progress.value > VIDEO_PLAY_START_PROGRESS && !isRebuffering.value) {
      if (videoEl.paused) {
        videoEl.play().catch(() => {})
      }
      if (videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const currentTime = videoEl.currentTime
        if (Math.abs(currentTime - lastUploadedVideoTime) > 0.0001) {
          videoTexture.needsUpdate = true
          lastUploadedVideoTime = currentTime
        }
      }
    } else if (!videoEl.paused) {
      videoEl.pause()
    }
  }

  updateCameraFraming()

  renderer.render(scene, camera)
}

function onResize() {
  if (!renderer || !camera || !containerRef.value) return
  const stickyEl = containerRef.value.querySelector('.macbook-sticky') as HTMLElement | null
  if (!stickyEl) return

  renderer.setSize(stickyEl.clientWidth, stickyEl.clientHeight)
  camera.aspect = stickyEl.clientWidth / stickyEl.clientHeight
  camera.updateProjectionMatrix()
  updateCameraFraming(true)
}

function handleUnmute() {
  if (!videoEl) return
  videoEl.muted = false
  isMuted.value = false
}

onMounted(() => {
  isUnmounted = false
  isRebuffering.value = false
  lastUploadedVideoTime = -1
  lastCameraRefitProgress = Number.NaN
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  onScroll()

  void primeVideoForRender()
    .then(() => {
      if (!isUnmounted) {
        initScene()
      }
    })
    .catch((err) => {
      console.error('[MacbookScene] Video priming failed:', err)
    })
})

onBeforeUnmount(() => {
  isUnmounted = true
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)

  cleanupVideoPrimeListeners?.()
  cleanupVideoPrimeListeners = null
  cleanupVideoRuntimeListeners?.()
  cleanupVideoRuntimeListeners = null

  if (rafId) cancelAnimationFrame(rafId)

  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
  }

  if (videoTexture) {
    videoTexture.dispose()
    videoTexture = null
  }

  if (videoEl) {
    videoEl.pause()
    videoEl.removeAttribute('src')
    videoEl.load()
    videoEl.remove()
    videoEl = null
  }
})
</script>

<template>
  <div ref="containerRef" class="relative w-full bg-black" style="height: 300vh;">
    <div class="macbook-sticky sticky top-0 w-full overflow-hidden" style="height: 100vh;">
      <SectionLoader
        v-if="!isSceneReady"
        min-height="100vh"
        style="position: absolute; inset: 0; z-index: 40;"
      />

      <div
        v-if="!isSceneReady"
        class="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-white/60 text-xs tracking-[0.08em]"
        style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;"
      >
        Menyiapkan video {{ bufferedPreviewLabel }}
      </div>

      <div
        v-if="isSceneReady && isRebuffering"
        class="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full border border-white/10 bg-black/50 backdrop-blur-md text-white/70 text-xs tracking-[0.08em]"
        style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;"
      >
        Buffering ulang {{ bufferedPreviewLabel }}
      </div>

      <!-- "Video Penugasan" label above the MacBook -->
      <div
        v-show="isSceneReady"
        class="absolute left-1/2 -translate-x-1/2 text-center"
        style="top: 10vh; z-index: 20;"
      >
        <a
          href="https://drive.google.com/file/d/1WRF5kvfzRzWCtE1UPkvyabARF5GigsRS/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-4 decoration-white/35 text-white/40 text-[12px] tracking-[0.3em] uppercase hover:text-white/70 hover:decoration-white/60 transition-colors duration-300"
          style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600;"
        >
          Video Penugasan
        </a>
      </div>

      <button
        v-if="isSceneReady && isMuted && progress > VIDEO_PLAY_START_PROGRESS"
        @click="handleUnmute"
        class="absolute bottom-8 right-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm cursor-pointer hover:bg-white/20 transition-all duration-300"
        style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
        Tap untuk suara
      </button>
    </div>
  </div>
</template>
