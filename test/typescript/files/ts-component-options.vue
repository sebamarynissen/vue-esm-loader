<template>
  <div>This is a Typescript Vue component</div>
  <div>My message title: {{ message.title }}</div>
  <div>My message body: {{ message.body }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

export default defineComponent({
  props: {
    message: { type: Object as PropType<{title: string, body: string}>, required: true }
  }
});
</script>
