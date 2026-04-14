<script setup lang="ts">
import type { SearchStatus } from '../../types'

defineProps<{
  status: SearchStatus
  resultCount: number
  errorMessage: string
}>()
</script>

<template>
  <footer class="border-t border-slate-100 px-6 py-4 flex items-center shrink-0">
    <Transition name="fade" mode="out-in">
      <span
        v-if="status === 'loading'"
        key="loading"
        class="text-[14px] font-medium text-slate-400"
      >
        Searching ...
      </span>
      <span
        v-else-if="status === 'success'"
        key="success"
        class="text-[14px] font-medium text-slate-400"
      >
        {{ resultCount }} result{{ resultCount !== 1 ? 's' : '' }}
      </span>
      <span
        v-else-if="status === 'empty'"
        key="empty"
        class="text-[14px] font-medium text-slate-400"
      >
        No result
      </span>
      <span
        v-else-if="status === 'error'"
        key="error"
        class="text-[14px] font-semibold text-error"
      >
        {{ errorMessage }}
      </span>
      <span v-else key="idle" />
    </Transition>
  </footer>
</template>
