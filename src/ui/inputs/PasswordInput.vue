<script setup lang="ts">
import { ref } from "vue";

import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import { EyeSlashIcon, EyeIcon } from "@heroicons/vue/24/outline";
import IconButton from "@src/ui/inputs/IconButton.vue";

const modelValue = defineModel<string>();

const props = defineProps<{
  id?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  description?: string;
  bordered?: boolean;
  class?: string;
}>();

const showPassword = ref(false);
</script>

<template>
  <LabeledTextInput
    :id="props.id"
    v-model="modelValue"
    :type="showPassword ? 'text' : 'password'"
    :label="props.label"
    :placeholder="props.placeholder"
    :class="props.class"
    :bordered="props.bordered"
  >
    <template #endAdornment>
      <IconButton
        title="toggle password visibility"
        aria-label="toggle password visibility"
        class="m-[.5rem] p-2"
        @click="showPassword = !showPassword"
      >
        <EyeSlashIcon v-if="showPassword" class="w-5 h-5" />
        <EyeIcon v-else class="w-5 h-5" />
      </IconButton>
    </template>
  </LabeledTextInput>
</template>
