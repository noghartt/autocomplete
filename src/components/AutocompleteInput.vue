<script setup lang="ts">
import { onMounted, nextTick, watch } from 'vue';
import Quill from 'quill';

import { closeSuggestions, openSuggestions, state } from './AutocompleteStore';

onMounted(() => {
  const quill = new Quill('.editor--root', {
    placeholder: 'What will you pick?',
    modules: {
      toolbar: false,
      keyboard: {
        bindings: {
          enter: {
            key: 'Enter',
            handler: () => false,
          },
        },
      },
    },
  });

  // TODO: Avoid the paste handler while not formatting the text
  quill.clipboard.onPaste = () => null;

  function stylizeTextOnChange(text: string) {
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
      return;
    }

    const queryValue = quill.getText({ index: queryStartIndex, length: queryLength - 1 });
    state.queryValue = queryValue;

    quill.formatText(queryStartIndex, queryLength, 'code', true, 'silent');
  }

  quill.on(Quill.events.TEXT_CHANGE, async function (_, __, source) {
    const text = quill.getText();
    state.rawValue = text;

    if (source !== 'user') {
      return;
    }

    quill.removeFormat(0, text.length - 1);
    stylizeTextOnChange(text);
  });

  quill.root.addEventListener('keydown', async (event) => {
    await nextTick();
    const key = event.key;
    const methodPerKey: Record<string, () => void> = {
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
        }
      },
    };

    if (methodPerKey[key]) {
      event.preventDefault();
      methodPerKey[key]();
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
      closeSuggestions();
    },
  );
});
</script>

<template>
  <div
    class="editor--root"
    :class="{ 'editor--root-suggestion-open': state.isSuggestionsOpen }"
  ></div>
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
    color: #444444;
    background-color: rgba(68, 68, 68, 0.1);
    font-family: 'GT America', sans-serif;
    padding: 2px 8px;
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
