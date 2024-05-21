<script setup lang="ts">
import { ListboxRoot, ListboxContent, ListboxItem, ListboxVirtualizer } from 'radix-vue';
import { computed } from 'vue';

import { closeSuggestions, state, updateSelectedValue } from './AutocompleteStore';
import type { AcceptableValue } from 'node_modules/radix-vue/dist/shared/types';
import type { SelectEvent } from 'node_modules/radix-vue/dist/Combobox/ComboboxItem';

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

const onSelect = async (e: SelectEvent<AcceptableValue>) => {
  const value = e.detail.value as string;
  updateSelectedValue(value);
  closeSuggestions();
};

const showListbox = computed(() => state.items.length > 0 && state.isSuggestionsOpen);
const isTest = computed(() => process.env.NODE_ENV === 'test');
</script>

<template>
  <ListboxRoot
    v-if="showListbox"
    class="listbox--root"
    :class="{ 'listbox--root-open': state.isSuggestionsOpen }"
    selection-behavior="replace"
  >
    <ListboxContent class="listbox--content" data-listbox-content :onkeydown="onKeyDown">
      <ListboxVirtualizer
        v-if="!isTest"
        v-slot="{ option }"
        :options="state.items"
        :text-content="(opt) => opt"
        class="listbox--virtualizer"
        :estimate-size="35"
      >
        <ListboxItem :key="option" :value="option" class="listbox--item" @select="onSelect">
          {{ option }}
        </ListboxItem>
      </ListboxVirtualizer>
      <ListboxItem
        v-else
        v-for="item in state.items"
        :key="item"
        :value="item"
        class="listbox--item"
        @select="onSelect"
      >
        {{ item }}
      </ListboxItem>
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
  border-top: 1px solid var(--color-black-opacity);
}

.listbox--root-open {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.listbox--item {
  cursor: pointer;
  font-size: var(--font-size-md);
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
