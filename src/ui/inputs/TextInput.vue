<script setup lang="ts">
const model = defineModel<string>();

const props = defineProps<{
  id?: string;
  type?: string;
  name?: string;
  placeholder?: string;
  bordered?: boolean;
  size?: "small" | "medium";
}>();
</script>

<template>
  <input
    :id="props.id"
    v-model="model"
    :type="props.type || 'text'"
    :name="props.name"
    class="text-input"
    :class="[
      props.bordered ? 'bordered-input' : 'ringed-input',
      props.size === 'small' ? 'h-7' : 'h-8',
    ]"
    :placeholder="props.placeholder"
  />
</template>
