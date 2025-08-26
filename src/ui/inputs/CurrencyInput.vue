<script setup lang="ts">
import TextInput from "@src/ui/inputs/TextInput.vue";
const model = defineModel<string>();

const props = withDefaults(
  defineProps<{
    currency?: string;
    disabled?: boolean;
    size: "sm" | "md" | "lg";
  }>(),
  {
    currency: "₴",
    disabled: false,
    size: "sm",
  },
);
</script>

<template>
  <div class="relative">
    <TextInput
      v-model="model"
      type="number"
      placeholder="0"
      :disabled="props.disabled"
      block
      variant="filled"
      :size="props.size"
      input-class="!border-solid !border-2 !border-app-border !pr-8 min-w-[6rem]"
    />
    <div
      class="absolute top-0 bottom-0 right-0 px-4 border-l-2 border-app-border flex items-center"
    >
      {{ props.currency }}
    </div>
  </div>
</template>
