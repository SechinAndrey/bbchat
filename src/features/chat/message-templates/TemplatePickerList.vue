<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import type { MessageTemplate } from "./types";
import SearchInput from "@src/ui/inputs/SearchInput.vue";
import { ArrowLongDownIcon, ArrowLongUpIcon } from "@heroicons/vue/24/outline";

interface Props {
  templates: MessageTemplate[];
  autoFocus?: boolean;
}

interface Emits {
  select: [template: MessageTemplate];
  cancel: [];
}

const props = withDefaults(defineProps<Props>(), {
  autoFocus: true,
});
const emit = defineEmits<Emits>();

const searchQuery = ref("");
const selectedIndex = ref(0);

const filteredTemplates = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.templates;
  }

  const query = searchQuery.value.toLowerCase();
  return props.templates.filter((template) =>
    template.text.toLowerCase().includes(query),
  );
});

watch(filteredTemplates, () => {
  selectedIndex.value = 0;
});

const handleSelectTemplate = (template: MessageTemplate) => {
  emit("select", template);
};

const handleKeyDown = (event: KeyboardEvent) => {
  const maxIndex = filteredTemplates.value.length - 1;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      selectedIndex.value = Math.min(selectedIndex.value + 1, maxIndex);
      scrollToSelected();
      break;
    case "ArrowUp":
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
      scrollToSelected();
      break;
    case "Enter":
      event.preventDefault();
      if (filteredTemplates.value[selectedIndex.value]) {
        handleSelectTemplate(filteredTemplates.value[selectedIndex.value]);
      }
      break;
    case "Escape":
      event.preventDefault();
      emit("cancel");
      break;
  }
};

const scrollToSelected = () => {
  const selectedElement = document.querySelector(
    `[data-template-index="${selectedIndex.value}"]`,
  );
  if (selectedElement) {
    selectedElement.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex-shrink-0 p-4 border-b border-app-border">
      <SearchInput
        v-model="searchQuery"
        placeholder="Пошук шаблонів"
        variant="filled"
        size="md"
      />
    </div>

    <div class="flex-1 overflow-y-auto p-4 min-h-0">
      <div
        v-if="filteredTemplates.length === 0"
        class="text-center py-8 text-app-text-secondary"
      >
        <p v-if="searchQuery">Нічого не знайдено</p>
        <p v-else>Немає доступних шаблонів</p>
      </div>

      <div v-else class="space-y-2">
        <button
          v-for="(template, index) in filteredTemplates"
          :key="template.id"
          :data-template-index="index"
          class="w-full text-left p-4 rounded-sm border transition-colors duration-200"
          :class="
            index === selectedIndex
              ? 'border-primary bg-primary/10'
              : 'border-app-border bg-app-bg hover:bg-app-bg-secondary'
          "
          @click="handleSelectTemplate(template)"
        >
          <p
            class="text-sm text-app-text whitespace-pre-wrap break-words line-clamp-3"
          >
            {{ template.text }}
          </p>
        </button>
      </div>
    </div>

    <!-- Keyboard hints - Fixed footer -->
    <div
      class="hidden flex-shrink-0 p-3 border-t border-app-border bg-app-bg-secondary text-xs text-app-text-secondary sm:flex items-center justify-center gap-4"
    >
      <span class="flex items-center gap-1">
        <ArrowLongUpIcon class="w-4 h-4" />
        <ArrowLongDownIcon class="w-4 h-4" />
        <span>Навігація</span>
      </span>
      <span><b>Enter</b> Вибрати</span>
      <span><b>Esc</b> Закрити</span>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
