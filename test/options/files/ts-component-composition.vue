<template>
  <div>This is a Typescript Vue component</div>
  <div>My message: {{ message }}</div>
</template>

<script setup lang="ts">
defineProps<{
  message: string,
}>();
</script>
