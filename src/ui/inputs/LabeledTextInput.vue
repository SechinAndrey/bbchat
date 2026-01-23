<script setup lang="ts">
import { computed } from "vue";
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
    error?: string;
  }>(),
  {
    type: "text",
    bordered: false,
    variant: "bordered",
    size: "sm",
  },
);

const labelTextSize = computed(() => {
  switch (props.size) {
    case "sm":
      return "text-sm";
    case "md":
      return "text-base";
    case "lg":
      return "text-lg";
    default:
      return "text-sm";
  }
});
</script>

<template>
  <div class="flex flex-col" :class="props.class">
    <label
      v-if="props.label"
      :id="props.id"
      class="mb-3 text-left text-base text-app-text-secondary"
      :class="labelTextSize"
    >
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
        :error="props.error"
      >
        <template #iconRight>
          <slot name="iconRight"></slot>
        </template>
      </TextInput>
    </div>
  </div>
</template>
