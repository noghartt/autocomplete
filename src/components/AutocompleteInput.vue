<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import Quill from 'quill';

import { createQuillInstance } from '@/lib/quill';

import { closeSuggestions, openSuggestions, state } from './AutocompleteStore';
import AutocompleteInputIcon from './AutocompleteInputIcon.vue';

const hasSelected = ref(false);

onMounted(() => {
  const quill = createQuillInstance({
    placeholder: 'What will you pick?',
    config: { disablePaste: true },
  });

  quill.on(Quill.events.TEXT_CHANGE, async function (_, __, source) {
    hasSelected.value = false;
    const text = quill.getText();
    state.rawValue = text;

    if (source !== 'user') {
      return;
    }

    quill.removeFormat(0, text.length - 1);

    const regex = /(.*?)I pick you\s*/gi;
    const match = regex.exec(text);
    if (!match) {
      return;
    }

    const beforeText = match[1];
    const startIndexPick = match.index + beforeText.length;
    const lengthPick = match[0].length - beforeText.length;

    quill.formatText(startIndexPick, lengthPick, 'color', 'var(--color-blue)', 'silent');

    const queryStartIndex = startIndexPick + lengthPick;
    const queryLength = text.length - queryStartIndex;

    if (queryLength <= 0) {
      state.queryValue = '';
      hasSelected.value = false;
      return;
    }

    const queryValue = quill.getText({ index: queryStartIndex, length: queryLength - 1 });
    state.queryValue = queryValue;

    quill.formatText(queryStartIndex, queryLength, 'code', true, 'silent');
  });

  quill.root.addEventListener('keydown', async (event) => {
    await nextTick();
    const key = event.key;
    const actionWhenPressedKey: Record<string, () => void> = {
      Escape: () => {
        closeSuggestions();
      },
      ArrowDown: () => {
        const el = document.querySelector<HTMLDivElement>('div[data-listbox-content]');

        if (!el && state.items.length > 0) {
          openSuggestions();
        }

        if (el) {
          el.focus();
          el.scrollIntoView({ block: 'nearest' });
          el.dataset.highlighted = '';
          hasSelected.value = false;
        }
      },
    };

    if (actionWhenPressedKey[key]) {
      event.preventDefault();
      actionWhenPressedKey[key]();
    }
  });

  watch(
    () => state.selectedValue,
    async (newValue) => {
      if (!newValue) {
        return;
      }

      const content = quill.getText();
      const regex = /(.*?)I pick you\s*/gi;
      const match = regex.exec(content);
      if (!match) {
        return;
      }

      const beforeText = match[1];

      quill.setContents([
        { insert: beforeText, attributes: {} },
        { insert: 'I pick you ', attributes: { color: 'var(--color-blue)' } },
        { insert: newValue, attributes: { code: true } },
      ]);

      state.selectedValue = '';
      hasSelected.value = true;
      closeSuggestions();
    },
  );
});
</script>

<template>
  <div
    class="editor--root"
    :class="{ 'editor--root-suggestion-open': state.isSuggestionsOpen }"
    data-testid="autocomplete-input"
  ></div>
  <AutocompleteInputIcon :show="hasSelected" />
</template>

<style>
.editor--root {
  position: relative;
  background-color: var(--color-white);
  width: 100%;
  padding: var(--spacing-4x) var(--spacing-6x);
  border-radius: var(--shape-radius);
}

.editor--root-suggestion-open {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.ql-editor {
  outline: none;

  & code {
    color: var(--color-black);
    background-color: var(--color-black-opacity);
    font-family: 'GT America', sans-serif;
    padding: 2px var(--spacing-2x);
    font-weight: 500;
    border-radius: var(--shape-radius);
  }

  & p {
    white-space: nowrap;
    overflow: hidden;
  }
}

.ql-editor.ql-blank::before {
  color: var(--color-grey);
  opacity: 0.33;
  content: attr(data-placeholder);
  pointer-events: none;
  position: absolute;
}
</style>
