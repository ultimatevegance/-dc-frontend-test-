<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useSearch } from '../../composables/useSearch'
import IconSpinner from '../icons/IconSpinner.vue'
import SearchBar from '../SearchBar/SearchBar.vue'
import Tag from '../Tag/Tag.vue'
import ResultItem from '../ResultItem/ResultItem.vue'
import EmptyIllustration from '../illustrations/EmptyIllustration.vue'
import ErrorIllustration from '../illustrations/ErrorIllustration.vue'
import SearchFooter from './SearchFooter.vue'

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_TAGS = ['Languages', 'Build', 'Design', 'Cloud']

// ─── Search state ─────────────────────────────────────────────────────────────

const { query, results, status, errorMessage, clearSearch } = useSearch()

// ─── Keyboard navigation ──────────────────────────────────────────────────────

const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null)
const resultRefs = ref<HTMLElement[]>([])
const focusedIndex = ref(-1)

const activeTag = computed(() =>
  QUICK_TAGS.find((t) => t.toLowerCase() === query.value.toLowerCase()) ?? null,
)

function selectTag(tag: string) {
  if (activeTag.value === tag) {
    clearSearch()
  } else {
    query.value = tag
  }
  focusedIndex.value = -1
  nextTick(() => searchBarRef.value?.focus())
}

function focusResult(index: number) {
  focusedIndex.value = index
  nextTick(() => resultRefs.value[index]?.focus())
}

function handleSearchKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' && results.value.length > 0) {
    e.preventDefault()
    focusResult(0)
  } else if (e.key === 'Escape') {
    clearSearch()
  }
}

function handleResultKeydown(e: KeyboardEvent, index: number) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      if (index < results.value.length - 1) focusResult(index + 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      if (index === 0) {
        focusedIndex.value = -1
        nextTick(() => searchBarRef.value?.focus())
      } else {
        focusResult(index - 1)
      }
      break
    case 'Escape':
      clearSearch()
      nextTick(() => searchBarRef.value?.focus())
      break
  }
}

function setResultRef(el: unknown, index: number) {
  const element = (el as { $el?: HTMLElement } | null)?.$el
  if (element) resultRefs.value[index] = element
}

// ─── Body height animation ────────────────────────────────────────────────────
//
// ResizeObserver watches the inner content div. Whenever its height changes
// (new results, state switch, etc.) we sync the outer wrapper to that height.
// The CSS transition on the wrapper then smoothly animates the change.
// The article's overflow:hidden clips any content that extends beyond the
// wrapper during the animation, so no explicit overflow:hidden is needed here.

const bodyEl = ref<HTMLElement | null>(null)
const contentEl = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!bodyEl.value || !contentEl.value) return
  resizeObserver = new ResizeObserver(() => {
    if (bodyEl.value && contentEl.value) {
      bodyEl.value.style.height = contentEl.value.offsetHeight + 'px'
    }
  })
  resizeObserver.observe(contentEl.value)
})

onUnmounted(() => resizeObserver?.disconnect())
</script>

<template>
  <article
    class="w-[690px] bg-white rounded-2xl overflow-hidden flex flex-col"
    :style="{ boxShadow: 'var(--shadow-card)' }"
    role="search"
    aria-label="Technology search"
  >
    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <div class="px-5 pt-5 pb-4">
      <SearchBar
        ref="searchBarRef"
        v-model="query"
        :status="status"
        @keydown="handleSearchKeydown"
      />

      <div
        class="flex items-center gap-2 mt-3 flex-wrap"
        role="group"
        aria-label="Quick filters"
      >
        <Tag
          v-for="tag in QUICK_TAGS"
          :key="tag"
          :label="tag"
          :active="activeTag === tag"
          @click="selectTag(tag)"
        />
      </div>
    </div>

    <!-- ── Body ──────────────────────────────────────────────────────────── -->
    <div ref="bodyEl" class="relative" style="transition: height 0.35s cubic-bezier(0.22, 1, 0.36, 1)">
      <div ref="contentEl">

        <Transition name="fade" mode="out-in">
          <!-- First search — gives the loading mask space before results arrive -->
          <div
            v-if="status === 'loading' && results.length === 0"
            key="loading-init"
            class="h-[200px]"
          />

          <!-- Results list -->
          <div
            v-else-if="results.length > 0"
            key="results"
            class="px-2 pb-2 max-h-[480px] overflow-y-auto"
          >
            <ul aria-live="polite" :aria-label="`${results.length} results found`">
              <li
                v-for="(result, index) in results"
                :key="result.title"
                class="result-enter"
                :style="{ animationDelay: `${index * 55}ms` }"
              >
                <ResultItem
                  :ref="(el) => setResultRef(el, index)"
                  :result="result"
                  :is-focused="focusedIndex === index"
                  @keydown="handleResultKeydown($event, index)"
                />
              </li>
            </ul>
          </div>

          <div
            v-else-if="status === 'empty'"
            key="empty"
            class="flex items-center justify-center py-12"
            aria-live="polite"
            aria-label="No results found"
          >
            <EmptyIllustration />
          </div>

          <div
            v-else-if="status === 'error'"
            key="error"
            class="flex items-center justify-center py-12"
            aria-live="assertive"
            aria-label="Error loading results"
          >
            <ErrorIllustration />
          </div>
        </Transition>

        <!-- Loading mask: fades over any content while a request is in-flight -->
        <Transition name="fade">
          <div
            v-if="status === 'loading'"
            class="absolute inset-0 flex items-center justify-center bg-white/70"
            aria-live="polite"
            aria-label="Searching…"
          >
            <IconSpinner />
          </div>
        </Transition>

      </div>
    </div>

    <!-- ── Footer ─────────────────────────────────────────────────────────── -->
    <SearchFooter
      :status="status"
      :result-count="results.length"
      :error-message="errorMessage"
    />
  </article>
</template>
