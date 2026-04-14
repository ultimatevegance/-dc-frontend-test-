<script setup lang="ts">
import SearchBox from './components/SearchBox/SearchBox.vue'
import IconDC from './components/icons/IconDC.vue'
</script>

<template>
  <main class="min-h-screen bg-surface flex items-start justify-center pt-[142px] px-6 pb-6">
    <SearchBox />
    <IconDC class="fixed bottom-6 right-6" />
  </main>
</template>
