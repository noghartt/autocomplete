<script setup lang="ts">
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});
</script>

<template>
  <div v-if="props.show" class="autocomplete-input-icon--container">
    <svg width="25" height="15" viewBox="0 0 25 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21.8599 1.25V6.25H5.22412L9.74623 1.7625L7.96518 0L0.38623 7.5L7.96518 15L9.74623 13.2375L5.22412 8.75H24.3862V1.25H21.8599Z"
        fill="#D3CDB8"
      />
    </svg>
  </div>
</template>

<style>
.autocomplete-input-icon--container {
  position: absolute;
  top: 40%;
  right: 2%;
}
</style>
