<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const props = defineProps<{
  videoSrc: string
}>()

// ─── DOM Refs ──────────────────────────────────────────────────────────────────
const containerRef = ref<HTMLElement | null>(null)

// ─── State ─────────────────────────────────────────────────────────────────────
const progress = ref(0)
const isMuted = ref(true)

// ─── Asset Path ────────────────────────────────────────────────────────────────
const modelUrl = new URL('../../resources/models/macbookpro.glb', import.meta.url).href

// ─── Three.js objects ──────────────────────────────────────────────────────────
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let macbookGroup: THREE.Group | null = null
let lidNode: THREE.Object3D | null = null
let videoEl: HTMLVideoElement | null = null
let videoTexture: THREE.VideoTexture | null = null
let rafId = 0

const LID_CLOSED_QUAT = new THREE.Quaternion(0, 0, 0, 1)
const LID_OPEN_QUAT = new THREE.Quaternion(-0.7660, 0, 0, 0.6428)

// ─── Scroll handler ───────────────────────────────────────────────────────────
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

// ─── Video Initializer ────────────────────────────────────────────────────────
function createVideoTexture(): THREE.VideoTexture {
  videoEl = document.createElement('video')
  videoEl.src = props.videoSrc
  videoEl.crossOrigin = 'anonymous'
  videoEl.loop = true
  videoEl.muted = true
  videoEl.playsInline = true
  videoEl.autoplay = true
  videoEl.style.display = 'none'
  document.body.appendChild(videoEl)

  videoTexture = new THREE.VideoTexture(videoEl)
  videoTexture.colorSpace = THREE.SRGBColorSpace
  videoTexture.minFilter = THREE.LinearFilter
  videoTexture.magFilter = THREE.LinearFilter
  videoTexture.generateMipmaps = false
  videoTexture.flipY = false 

  return videoTexture
}

// ─── Init Scene ───────────────────────────────────────────────────────────────
function initScene() {
  const container = containerRef.value
  if (!container) return
  const stickyEl = container.querySelector('.macbook-sticky') as HTMLElement
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
    const model = gltf.scene
    macbookGroup = new THREE.Group()

    model.traverse((child) => {
      if (child.name === 'Macbook_lid') lidNode = child
      if (child.name === 'Macbook_screen_surface' && (child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        
        // 🚨 GOD-MODE UV FIX 🚨
        // Instead of guessing vertex order, we perform a planar projection
        // based on the local X and Y coordinates of the geometry.
        const geo = mesh.geometry
        geo.computeBoundingBox()
        const box = geo.boundingBox!
        const pos = geo.attributes.position
        const uv = new Float32Array(pos.count * 2)

        for (let i = 0; i < pos.count; i++) {
          const px = pos.getX(i)
          const py = pos.getY(i)
          // Normalize [-box.min, box.max] to [0, 1] - Flipping Y for correct orientation
          uv[i * 2] = (px - box.min.x) / (box.max.x - box.min.x)
          uv[i * 2 + 1] = 1.0 - ((py - box.min.y) / (box.max.y - box.min.y))
        }

        geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
        geo.attributes.uv.needsUpdate = true

        const screenMat = new THREE.MeshBasicMaterial({
          map: vTex,
        })
        screenMat.toneMapped = false
        mesh.material = screenMat
      }
    })

    if (lidNode) lidNode.quaternion.copy(LID_CLOSED_QUAT)
    macbookGroup.add(model)
    scene!.add(macbookGroup)
    
    animate()
  })
}

function animate() {
  rafId = requestAnimationFrame(animate)
  if (!renderer || !scene || !camera || !macbookGroup) return

  if (lidNode) {
    const t = Math.min(1, progress.value / 0.5)
    const eased = 1 - Math.pow(1 - t, 3)
    const q = new THREE.Quaternion()
    q.slerpQuaternions(LID_CLOSED_QUAT, LID_OPEN_QUAT, eased)
    lidNode.quaternion.copy(q)
  }

  // Play/Pause and Update Logic
  if (videoEl && videoTexture) {
    if (progress.value > 0.45) {
      if (videoEl.paused) {
        videoEl.play().catch(() => {})
      }
      videoTexture.needsUpdate = true
    } else {
      if (!videoEl.paused) videoEl.pause()
    }
  }

  // Framing
  const box = new THREE.Box3().setFromObject(macbookGroup)
  const center = new THREE.Vector3()
  box.getCenter(center)
  const size = new THREE.Vector3()
  box.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z)
  const fov = camera.fov * (Math.PI / 180)
  const dist = (maxDim / 2) / Math.tan(fov / 2) * 0.92
  camera.position.set(center.x, center.y + 0.15, Math.max(dist, 3.8))
  camera.lookAt(center.x, center.y, center.z)

  renderer.render(scene, camera)
}

function onResize() {
  if (!renderer || !camera || !containerRef.value) return
  const stickyEl = containerRef.value.querySelector('.macbook-sticky') as HTMLElement
  renderer.setSize(stickyEl.clientWidth, stickyEl.clientHeight)
  camera.aspect = stickyEl.clientWidth / stickyEl.clientHeight
  camera.updateProjectionMatrix()
}

function handleUnmute() {
  if (videoEl) {
    videoEl.muted = false
    isMuted.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  onScroll()
  initScene()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  if (rafId) cancelAnimationFrame(rafId)
  if (renderer) { renderer.dispose(); renderer.domElement.remove() }
  if (videoEl) { videoEl.pause(); videoEl.src = ''; videoEl.remove() }
})
</script>

<template>
  <div ref="containerRef" class="relative w-full bg-black" style="height: 300vh;">
    <div class="macbook-sticky sticky top-0 w-full overflow-hidden" style="height: 100vh;">
      <!-- "Video Penugasan" label above the MacBook -->
      <div class="absolute left-1/2 -translate-x-1/2 text-center"
           style="top: 10vh;">
        <a href="https://drive.google.com/file/d/1WRF5kvfzRzWCtE1UPkvyabARF5GigsRS/view?usp=sharing"
           target="_blank"
           rel="noopener noreferrer"
           class="text-white/40 text-[12px] tracking-[0.3em] uppercase hover:text-white/70 transition-colors duration-300"
           style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600;"
        >Video Penugasan</a>
      </div>

      <!-- 🔇 Click-to-unmute button -->
      <button
        v-if="isMuted && progress > 0.45"
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
