<script setup lang="ts">
import { computed } from "vue";
import TextInput from "@src/ui/inputs/TextInput.vue";
const model = defineModel<number | null>();

const props = withDefaults(
  defineProps<{
    currency?: string;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
  }>(),
  {
    currency: "₴",
    disabled: false,
    size: "sm",
  },
);

// Convert between number and string for TextInput
const stringValue = computed({
  get: () => model.value?.toString() ?? "",
  set: (value: string) => {
    if (value === "") {
      model.value = null;
    } else {
      const numValue = Number(value);
      model.value = isNaN(numValue) ? null : numValue;
    }
  },
});
</script>

<template>
  <div class="relative">
    <TextInput
      v-model="stringValue"
      type="number"
      placeholder="0"
      :disabled="props.disabled"
      block
      variant="filled"
      :size="props.size"
      input-class="!border-solid !border-2 !border-app-border !pr-8 min-w-[6rem]"
    />
    <div
      class="absolute top-0 right-0 px-4 border-l-2 border-app-border flex items-center h-[calc(100%-0.75rem)]"
    >
      {{ props.currency }}
    </div>
  </div>
</template>
