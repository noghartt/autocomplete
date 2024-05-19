import { reactive } from 'vue';

type State = {
  isSuggestionsOpen: boolean;
  rawValue: string;
  queryValue: string;
  selectedValue: string;
  items: string[];
  itemsRef: Element[];
};

export const state = reactive<State>({
  isSuggestionsOpen: false,
  rawValue: '',
  queryValue: '',
  selectedValue: '',
  items: [],
  itemsRef: [],
});

export const closeSuggestions = () => {
  state.isSuggestionsOpen = false;
};

export const openSuggestions = () => {
  state.isSuggestionsOpen = true;
};

export const setItems = (items: string[]) => {
  state.items = items;
};

export const removeItems = () => {
  state.items = [];
};

export const pushItemRef = (itemRef: Element) => {
  state.itemsRef.push(itemRef);
};

export const updateSelectedValue = (value: string) => {
  state.selectedValue = value;
};
