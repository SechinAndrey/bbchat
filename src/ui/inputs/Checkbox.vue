<script setup lang="ts">
import { computed } from "vue";
import { CheckIcon } from "@heroicons/vue/24/outline";

const model = defineModel<boolean | unknown[]>();
const props = withDefaults(defineProps<{ value?: unknown; size?: string }>(), {
  // Default checkbox size (Tailwind h-5 w-5)
  size: "5",
  value: undefined,
});

const isChecked = computed(() => {
  if (Array.isArray(model.value)) {
    return props.value !== undefined && model.value.includes(props.value);
  }
  return !!model.value;
});

const handleChange = () => {
  if (Array.isArray(model.value)) {
    if (props.value === undefined) return;

    const newValue = [...model.value];
    const index = newValue.indexOf(props.value);

    if (index > -1) newValue.splice(index, 1);
    else newValue.push(props.value);

    model.value = newValue;
  } else {
    model.value = !model.value;
  }
};
</script>

<template>
  <div
    class="relative flex items-center justify-center cursor-pointer"
    :class="`h-${props.size} w-${props.size}`"
    @click="handleChange"
  >
    <div
      class="appearance-none rounded-[.3125rem] border border-primary outline-none transition-all duration-300"
      :class="[{ 'bg-primary': isChecked }, `h-${props.size} w-${props.size}`]"
    ></div>
    <CheckIcon
      v-if="isChecked"
      class="pointer-events-none absolute h-4 w-4 text-white"
    />
  </div>
</template>
