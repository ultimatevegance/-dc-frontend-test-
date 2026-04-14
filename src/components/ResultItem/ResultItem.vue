<script setup lang="ts">
import type { SearchResult } from '../../types'
import IconExternalLink from '../icons/IconExternalLink.vue'

defineProps<{
  result: SearchResult
  isFocused?: boolean
}>()

const emit = defineEmits<{
  keydown: [event: KeyboardEvent]
}>()
</script>

<template>
  <a
    :href="result.url"
    target="_blank"
    rel="noopener noreferrer"
    class="flex items-center gap-4 px-3 py-3 rounded-2xl group transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    :class="isFocused ? 'bg-result-hover' : 'hover:bg-result-hover'"
    tabindex="0"
    :aria-label="`${result.title} — ${result.description}. Opens in new tab.`"
    @keydown="emit('keydown', $event)"
  >
    <!-- Logo -->
    <div
      class="w-[76px] h-[76px] flex-shrink-0 rounded-xl bg-white flex items-center justify-center overflow-hidden"
    >
      <img
        :src="result.image"
        :alt="result.title"
        class="w-12 h-12 object-contain"
        loading="lazy"
      />
    </div>

    <!-- Text content -->
    <div class="flex-1 min-w-0">
      <p class="text-[15px] font-semibold text-slate-800 leading-snug">
        {{ result.title }}
      </p>
      <p class="text-[13px] text-slate-400 truncate mt-0.5 leading-snug">
        {{ result.description }}
      </p>
    </div>

    <!-- External link indicator — visible on hover/focus -->
    <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-150 text-slate-300">
      <IconExternalLink />
    </div>
  </a>
</template>
