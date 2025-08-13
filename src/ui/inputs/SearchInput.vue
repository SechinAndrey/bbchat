<script setup lang="ts">
import { computed } from "vue";
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/vue/24/outline";
import TextInput from "@src/ui/inputs/TextInput.vue";
import Button from "@src/ui/inputs/Button.vue";

const model = defineModel<string>();

// Inherit props from TextInput for consistency
type TextInputProps = InstanceType<typeof TextInput>["$props"];

const props = defineProps<{
  size?: TextInputProps["size"];
  variant?: TextInputProps["variant"];
  placeholder?: string;
  disabled?: boolean;
}>();

const closeIconBtnSizeList = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-7 h-7",
};

const closeIconBtnSize = computed(() => {
  if (props.size) {
    return closeIconBtnSizeList[props.size];
  }
  return closeIconBtnSizeList.md;
});

const closeIconHeightList = {
  sm: "h-5",
  md: "h-6",
  lg: "h-7",
};

const closeIconHeight = computed(() => {
  if (props.size) {
    return closeIconHeightList[props.size];
  }
  return closeIconHeightList.md;
});
</script>

<template>
  <TextInput
    v-model="model"
    :placeholder="placeholder || 'Пошук...'"
    :size="size"
    :variant="variant"
    :disabled="disabled"
  >
    <template #iconLeft="slotProps">
      <MagnifyingGlassIcon
        :class="[slotProps.class, 'text-app-text-secondary']"
      />
    </template>
    <template #iconRight>
      <Button
        v-if="model"
        variant="ghost"
        size="sm"
        icon-only
        :ring="false"
        class="!p-1"
        :class="[closeIconHeight]"
        aria-label="Очистити пошук"
        @click="model = ''"
      >
        <template #icon="slotProps">
          <XCircleIcon :class="[slotProps.class, closeIconBtnSize]" />
        </template>
      </Button>
    </template>
  </TextInput>
</template>
