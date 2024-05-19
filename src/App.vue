<script setup lang="ts">
import { ref, watch } from 'vue';
import './assets/global.css';
import AutocompleteInput from './components/AutocompleteInput.vue';
import AutocompleteSuggestionList from './components/AutocompleteSuggestionList.vue';
import { CONFIG } from './config';
import { closeSuggestions, openSuggestions, setItems, state } from './components/AutocompleteStore';

const items = ref();

type APIResponse = {
  completions: Array<{ phrase: string; score: number }>;
};

watch(
  () => [state.rawValue, state.queryValue],
  async ([newValue, newQuery]) => {
    setItems([]);
    if (!newValue || newValue === '\n' || !newQuery) {
      items.value = [];
      closeSuggestions();
      return;
    }

    const uri = encodeURIComponent(newQuery.trim());
    const urlCompletion = `${CONFIG.API_URL}/completion?query=${uri}`;

    const response = await fetch(urlCompletion);
    if (!response.ok) {
      return;
    }

    const data: APIResponse = await response.json();
    const mappedItems = data.completions.map((item) => item.phrase);
    setItems(mappedItems);

    const hasPokemonInserted = mappedItems.find((item) => newValue.endsWith(item + '\n'));

    if (!hasPokemonInserted) {
      openSuggestions();
    }
  },
);
</script>

<template>
  <main class="container">
    <section class="container--editor">
      <AutocompleteInput />
      <AutocompleteSuggestionList />
    </section>
  </main>
</template>

<style scoped>
.container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100vw;
}

.container--editor {
  position: relative;
  width: 80%;
}
</style>
