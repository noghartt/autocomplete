<script setup lang="ts">
import { ListboxRoot, ListboxContent, ListboxItem, ListboxVirtualizer } from 'radix-vue';
import { computed, ref, watch } from 'vue';

import { closeSuggestions, state, updateSelectedValue } from './AutocompleteStore';

export interface Props {
  items: string[];
}

const selectedValue = ref<string | null>(state.selectedValue);
watch(selectedValue, (newValue) => {
  if (!newValue) {
    updateSelectedValue('');
    return;
  }

  updateSelectedValue(newValue);
});

const showListbox = computed(() => state.items.length > 0 && state.isSuggestionsOpen);

const onKeyDown = (e: KeyboardEvent) => {
  const key = e.key;
  const methodPerKey: Record<string, () => void> = {
    Escape: () => {
      closeSuggestions();
      const inputEl = document.querySelector<HTMLInputElement>('.ql-editor');
      if (inputEl) {
        inputEl.focus();
      }
    },
  };

  if (methodPerKey[key]) {
    e.preventDefault();
    methodPerKey[key]();
  }
};
</script>

<template>
  <ListboxRoot
    v-if="showListbox"
    v-model="selectedValue"
    class="listbox--root"
    :class="{ 'listbox--root-open': state.isSuggestionsOpen }"
    selection-behavior="replace"
  >
    <ListboxContent class="listbox--content" data-listbox-content :onkeydown="onKeyDown">
      <ListboxVirtualizer
        v-slot="{ option }"
        :options="state.items"
        :text-content="(opt) => opt"
        class="listbox--virtualizer"
        :estimate-size="35"
      >
        <ListboxItem :key="option" :value="option" class="listbox--item">
          {{ option }}
        </ListboxItem>
      </ListboxVirtualizer>
    </ListboxContent>
  </ListboxRoot>
</template>

<style scoped>
.listbox--root {
  position: absolute;
  background-color: var(--color-white);
  padding: var(--spacing-4x);
  border-radius: var(--shape-radius);
  max-height: 184px;
  overflow-y: auto;
  width: 100%;
  border-top: 1px solid rgba(68, 68, 68, 0.1);
}

.listbox--root-open {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.listbox--item {
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  outline: none;
  width: 100%;
  color: var(--color-black);
  padding: var(--spacing-2x) var(--spacing-4x);

  &[data-state='checked'],
  &[data-highlighted] {
    background-color: rgba(68, 68, 68, 0.1);
  }
}

.listbox--content {
  position: relative;
}
</style>