<script setup lang="ts">
import { ref } from 'vue'
import type { SearchStatus } from '../../types'
import IconSearch from '../icons/IconSearch.vue'

defineProps<{
  modelValue: string
  status: SearchStatus
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  keydown: [event: KeyboardEvent]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

defineExpose({
  focus: () => inputRef.value?.focus(),
})
</script>

<template>
  <div class="relative">
    <span class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
      <IconSearch />
    </span>

    <input
      ref="inputRef"
      type="text"
      :value="modelValue"
      placeholder="Search what technologies we are using at DC..."
      autocomplete="off"
      spellcheck="false"
      aria-label="Search technologies"
      class="w-full h-[74px] pl-12 pr-4 rounded-2xl bg-input-bg border-2 text-[20px] font-medium leading-[26px] text-slate-800 placeholder:font-normal placeholder:text-slate-400 outline-none transition-all duration-200"
      :class="{
        'border-error': status === 'error',
        'border-input-focused': status !== 'error' && isFocused,
        'border-transparent': status !== 'error' && !isFocused,
      }"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keydown="emit('keydown', $event)"
    />
  </div>
</template>
