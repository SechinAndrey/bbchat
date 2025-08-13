<script setup lang="ts">
import Button from "@src/ui/inputs/Button.vue";
const props = defineProps<{
  active: boolean;
  name: string;
  compact?: boolean;
}>();
</script>

<template>
  <Button
    class="flex-1 whitespace-nowrap"
    size="sm"
    :variant="active ? 'primary' : 'ghost'"
    :ring="false"
  >
    {{ props.name }}
  </Button>
</template>
