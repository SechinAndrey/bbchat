<script setup lang="ts">
import TextInput from "@src/ui/inputs/TextInput.vue";

const model = defineModel<string>();

const props = withDefaults(
  defineProps<{
    id?: string;
    type?: string;
    label?: string;
    name?: string;
    class?: string;
    placeholder?: string;
    bordered?: boolean;
    inputClass?: string;
    variant?: "default" | "bordered" | "filled";
    size?: "sm" | "md" | "lg";
  }>(),
  {
    type: "text",
    bordered: false,
    variant: "bordered",
    size: "sm",
  },
);
</script>

<template>
  <div class="flex flex-col">
    <label v-if="props.label" :id="props.id" class="mb-3 text-left text-sm">
      {{ props.label }}
    </label>

    <div class="relative">
      <div class="absolute left-0 top-0">
        <slot name="startAdornment"></slot>
      </div>

      <TextInput
        :id="props.id"
        v-model="model"
        :type="props.type"
        :name="props.name"
        :class="['', props.inputClass]"
        :bordered="props.bordered"
        :placeholder="props.placeholder"
        :variant="props.variant"
        :size="props.size"
      />

      <div class="absolute top-0 right-0">
        <slot name="endAdornment"></slot>
      </div>
    </div>
  </div>
</template>
