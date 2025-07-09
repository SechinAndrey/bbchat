<script setup lang="ts">
import TextInput from "@src/ui/inputs/TextInput.vue";

const model = defineModel<string | number>();

const props = defineProps<{
  id?: string;
  type?: string;
  label?: string;
  name?: string;
  class?: string;
  placeholder?: string;
  bordered?: boolean;
}>();
</script>

<template>
  <div class="flex flex-col">
    <label
      v-if="props.label"
      :id="props.id"
      class="body-2 text-color mb-3 text-left"
    >
      {{ props.label }}
    </label>

    <div class="relative">
      <div class="absolute left-0 top-0">
        <slot name="startAdornment"></slot>
      </div>

      <TextInput
        :id="props.id"
        :type="props.type || 'text'"
        :name="props.name"
        :value="model"
        class="text-input"
        :bordered="props.bordered"
        :placeholder="props.placeholder"
        @value-changed="(value) => (model = value)"
      />

      <div class="absolute top-0 right-0">
        <slot name="endAdornment"></slot>
      </div>
    </div>
  </div>
</template>
