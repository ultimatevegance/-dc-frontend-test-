<script setup lang="ts">
import IconTag from '../icons/IconTag.vue'

defineProps<{
  label: string
  active: boolean
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
    :class="
      active
        ? 'bg-brand text-white shadow-sm shadow-brand/20'
        : 'bg-input-bg text-brand border-brand/20 hover:border-brand/50 hover:bg-brand-light'
    "
    @click="emit('click')"
  >
    <IconTag />
    {{ label }}
  </button>
</template>
