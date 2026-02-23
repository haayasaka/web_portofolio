<script setup lang="ts">
const tasks = [
  {
    number: '#1',
    title: 'Terms of Reference.',
    description: 'Peserta ditugaskan untuk membuat sebuah TOR kegiatan yang bertujuan merancang kegiatan berdasarkan studi kasus yang terlampir.',
    link: 'https://drive.google.com/drive/folders/18NV-2gX8HD60TQ4eL9J_a4WRf2bP0lF6?usp=sharing',
  },
  {
    number: '#2',
    title: 'Inforgrafis Kreatif.',
    description: 'Peserta ditugaskan untuk membuat sebuah infografis yang bertujuan menyampaikan informasi secara ringkas, visual, dan mudah dipahami.',
    link: 'https://drive.google.com/drive/folders/1ymqPSgs2AxTyUUkwKNSAkVwAOCH6ts-C?usp=sharing',
  },
  {
    number: '#3',
    title: 'Website.',
    description: 'Mahasiswa membuat sebuah website portofolio personal yang merepresentasikan identitas diri secara komprehensif, sebagai bentuk personal branding.',
    link: 'https://haayasaka.github.io/web_portofolio/',
  },
]
</script>

<template>
  <section
    id="penugasan"
    class="relative w-full bg-black overflow-hidden"
    style="min-height: 100vh;"
    aria-label="Penugasan Section"
  >
    <div class="w-full px-10 pt-[80px] pb-10" style="min-height: 100vh;">
      <!-- Section title -->
      <h2 class="text-white text-[52px] font-semibold text-center tracking-tight mt-6 mb-12">Penugasan</h2>

      <!-- Three-column task grid -->
      <div class="grid grid-cols-3 gap-10 max-w-[1100px] mx-auto mt-8">
        <div
          v-for="task in tasks"
          :key="task.number"
          class="flex flex-col gap-3"
        >
          <p class="font-bold text-[32px]" style="color: #FF6B00;">{{ task.number }}</p>
          <p class="text-white text-[15px] leading-relaxed">
            <strong class="font-semibold">{{ task.title }}</strong>
            {{ task.description }}
          </p>
          <a
            :href="task.link"
            class="underline text-[15px] text-white cursor-pointer hover:text-white/70 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Klik disini
          </a>
        </div>
      </div>

      <!-- Video section -->
      <div class="max-w-[1100px] mx-auto mt-16">
        <h3 class="text-white text-[40px] font-semibold text-center mb-8">Video</h3>
        <!-- Video embed Google Drive 16:9 -->
        <div
          class="w-full rounded-xl overflow-hidden"
          style="aspect-ratio: 16/9; max-height: 620px; background: #000;"
        >
          <iframe
            src="https://drive.google.com/file/d/1gMIvUgeuVEIXLlbS6BV-4bPFX20CCc_h/preview"
            class="w-full h-full"
            style="border: none; display: block;"
            allow="autoplay; encrypted-media; fullscreen"
            allowfullscreen
            title="Video Penugasan"
          />
        </div>
      </div>
    </div>
  </section>
</template>
