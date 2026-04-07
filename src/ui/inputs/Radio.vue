<script setup lang="ts">
import { computed } from "vue";

const model = defineModel<unknown>();
const props = withDefaults(
  defineProps<{ value?: unknown; size?: string; label?: string }>(),
  {
    size: "5",
    value: undefined,
    label: undefined,
  },
);

const isChecked = computed(() => {
  return model.value === props.value;
});

const handleChange = () => {
  model.value = props.value;
};
</script>

<template>
  <div class="relative flex items-center cursor-pointer" @click="handleChange">
    <div
      class="flex items-center justify-center"
      :class="`w-${props.size} h-${props.size}`"
    >
      <div
        class="appearance-none rounded-full border border-primary outline-none transition-all duration-300"
        :class="`h-${props.size} w-${props.size}`"
      ></div>
      <div
        v-if="isChecked"
        class="pointer-events-none absolute rounded-full bg-primary"
        :class="`h-${Number(props.size) - 2} w-${Number(props.size) - 2}`"
      />
    </div>
    <span
      v-if="props.label"
      class="ml-3 select-none text-[0.813rem] whitespace-nowrap"
    >
      {{ props.label }}
    </span>
  </div>
</template>
