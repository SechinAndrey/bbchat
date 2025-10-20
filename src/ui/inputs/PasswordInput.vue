<script setup lang="ts">
import { ref } from "vue";

import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import { EyeSlashIcon, EyeIcon } from "@heroicons/vue/24/outline";
import IconButton from "@src/ui/inputs/IconButton.vue";

const modelValue = defineModel<string>();

const props = defineProps<{
  id?: string;
  label?: string;
  name?: string;
  class?: string;
  placeholder?: string;
  bordered?: boolean;
  inputClass?: string;
  variant?: "default" | "bordered" | "filled";
  size?: "sm" | "md" | "lg";
}>();

const showPassword = ref(false);
</script>

<template>
  <LabeledTextInput
    :id="props.id"
    v-model="modelValue"
    :type="showPassword ? 'text' : 'password'"
    :label="props.label"
    :name="props.name"
    :placeholder="props.placeholder"
    :bordered="props.bordered"
    :class="props.class"
    :input-class="props.inputClass"
    :variant="props.variant"
    :size="props.size"
  >
    <template #iconRight>
      <IconButton
        title="toggle password visibility"
        aria-label="toggle password visibility"
        @click="showPassword = !showPassword"
      >
        <EyeSlashIcon v-if="showPassword" class="w-5 h-5" />
        <EyeIcon v-else class="w-5 h-5" />
      </IconButton>
    </template>
  </LabeledTextInput>
</template>
