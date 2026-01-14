<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";
import Button from "@src/ui/inputs/Button.vue";

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  update: [];
  dismiss: [];
}>();
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="show"
      class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-app-bg-secondary border border-app-border rounded-lg p-4"
    >
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <h3 class="font-semibold text-app-text mb-1">
            Доступна нова версія додатку
          </h3>
          <p class="text-sm text-app-text-secondary mb-3">
            Оновіть додаток, щоб отримати нові функції
          </p>
          <div class="flex gap-2">
            <Button variant="primary" size="sm" @click="emit('update')">
              Оновити зараз
            </Button>
            <Button variant="text" size="sm" @click="emit('dismiss')">
              Пізніше
            </Button>
          </div>
        </div>
        <button
          class="text-app-text-secondary hover:text-app-text transition-colors"
          @click="emit('dismiss')"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </Transition>
</template>
