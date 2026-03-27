<script setup lang="ts">
import { computed } from "vue";
import Button from "@src/ui/inputs/Button.vue";
const props = defineProps<{
  active: boolean;
  name: string;
  compact?: boolean;
  activeClass?: string;
  inactiveClass?: string;
}>();

const classes = computed(() => {
  const result = ["flex-1", "whitespace-nowrap"];
  if (props.compact) {
    result.push("!px-2");
  }
  if (props.activeClass && props.active) {
    result.push(props.activeClass || "");
  }

  if (props.inactiveClass && !props.active) {
    result.push(props.inactiveClass || "");
  }
  return result.join(" ");
});
</script>

<template>
  <Button
    :class="classes"
    size="sm"
    :variant="active ? 'primary' : 'ghost'"
    :ring="false"
  >
    {{ props.name }}
  </Button>
</template>
