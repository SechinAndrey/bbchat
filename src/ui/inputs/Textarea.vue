<script setup lang="ts">
const modelValue = defineModel<string>();

const props = defineProps<{
  id?: string;
  name?: string;
  placeholder?: string;
  bordered?: boolean;
  autoResize?: boolean;
  rows?: number;
  textareaClass?: string;
}>();
</script>

<template>
  <textarea
    :id="props.id"
    ref="textarea"
    v-model="modelValue"
    :name="props.name"
    class="text-area"
    :class="[
      props.bordered ? 'bordered-input' : 'ringed-input',
      props.textareaClass,
    ]"
    :placeholder="props.placeholder"
    :rows="props.rows || 3"
  />
</template>
