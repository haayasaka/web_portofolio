<script setup lang="ts">
// Profile section - no props needed since navbar is global in App.vue
const profileImg = new URL('../../resources/images/profile.webp', import.meta.url).href
</script>

<template>
  <section
    id="profile"
    class="relative w-full bg-black overflow-hidden"
    style="min-height: 100vh;"
    aria-label="Profile Section"
  >
    <!-- Content: padded for global fixed navbar -->
    <div class="w-full flex flex-col items-center justify-center px-8 pt-[80px] pb-16" style="min-height: 100vh;">
      <div class="max-w-[1100px] w-full -translate-y-6">
        <!-- Section Title aligned to the text column center -->
        <div class="flex items-center gap-12 mb-12">
          <div class="w-[340px] flex-shrink-0" aria-hidden="true"></div>
          <h2 class="flex-1 text-white text-[52px] md:text-[60px] font-semibold text-center tracking-tight">Profile</h2>
        </div>

        <!-- Two-column layout -->
        <div class="flex items-center justify-center gap-12 w-full">
        <!-- Left: Photo placeholder with glow -->
        <div class="flex-shrink-0">
          <div
            class="rounded-2xl overflow-hidden flex items-center justify-center"
            style="width: 340px; height: 360px; background: #161616; box-shadow: 0 0 50px 15px rgba(255,255,255,0.07), 0 0 0 1px rgba(255,255,255,0.08);"
          >
            <img
              :src="profileImg"
              alt="Foto profil Hafiz Fauzan Syafrudin"
              class="w-full h-full object-cover"
              draggable="false"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <!-- Right: Bio text -->
        <div
          class="flex-1 text-[17px] md:text-[18px] leading-relaxed text-center"
          style="color: rgba(255,255,255,0.55);"
        >
          <p>
            Halo, saya <strong class="text-white font-semibold">Hafiz Fauzan Syafrudin</strong>, seorang IoT &amp; Fullstack
            Developer dan mahasiswa <strong class="text-white font-semibold">D4 Teknik Informatika</strong> di Politeknik
            Negeri Bandung. Saya berfokus dalam merancang dan
            membangun <strong class="text-white font-semibold">sistem dan aplikasi</strong> yang telah meraih <strong class="text-white font-semibold">juara</strong> di
            tingkat <strong class="text-white font-semibold">nasional</strong>. Saya suka memecahkan permasalahan
            kompleks dalam <strong class="text-white font-semibold">desain dan pengembangan</strong> aplikasi. Gaya
            kerja saya fleksibel, adaptif, dan mampu bekerja mandiri
            maupun berkolaborasi dalam tim. Keahlian dan <strong class="text-white font-semibold">tech stack
            utama</strong> saya adalah C/C++ &amp; Arduino (high mastery),
            serta HTML/CSS/JavaScript, Vue.js, dan Vuetify.
          </p>
        </div>
        </div>
      </div>
    </div>
  </section>
</template>
