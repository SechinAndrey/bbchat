<script setup lang="ts">
import type { Ref } from "vue";
import { onMounted, ref, watch } from "vue";

const modelValue = defineModel<string>();

const props = defineProps<{
  id?: string;
  name?: string;
  placeholder?: string;
  bordered?: boolean;
  autoResize?: boolean;
}>();

const textarea: Ref<HTMLTextAreaElement | null> = ref(null);

// change the size of the textarea
const handleAutoResize = () => {
  if (props.autoResize && textarea.value) {
    textarea.value.style.height = "auto";
    textarea.value.style.height = `${textarea.value.scrollHeight}px`;
  }
};

onMounted(() => {
  handleAutoResize();
});

watch(modelValue, () => {
  handleAutoResize();
});
</script>

<template>
  <textarea
    :id="props.id"
    ref="textarea"
    v-model="modelValue"
    :name="props.name"
    class="text-input"
    :class="[props.bordered ? 'bordered-input' : 'ringed-input']"
    :placeholder="props.placeholder"
  />
</template>
