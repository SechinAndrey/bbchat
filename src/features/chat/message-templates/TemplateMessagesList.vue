<script setup lang="ts">
import { computed } from "vue";
import Button from "@src/ui/inputs/Button.vue";
import { PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import type { MessageTemplate } from "./types";

interface Props {
  templates: MessageTemplate[];
  deletingTemplateId?: number | null;
}

interface Emits {
  edit: [template: MessageTemplate];
  delete: [templateId: number];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const hasTemplates = computed(() => props.templates.length > 0);

const handleEdit = (template: MessageTemplate) => {
  emit("edit", template);
};

const handleDelete = (templateId: number) => {
  if (props.deletingTemplateId !== null) return;
  emit("delete", templateId);
};
</script>

<template>
  <div v-if="hasTemplates" class="flex flex-col gap-3">
    <div
      v-for="template in templates"
      :key="template.id"
      class="group relative p-4 rounded-sm border border-app-border bg-app-bg hover:bg-app-bg-secondary transition-colors duration-200"
    >
      <p class="text-sm text-app-text pr-20 whitespace-pre-wrap break-words">
        {{ template.text }}
      </p>

      <div
        class="absolute top-3 right-3 flex items-center gap-2 xs:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
      >
        <Button
          variant="text"
          icon-only
          size="sm"
          :disabled="deletingTemplateId === template.id"
          @click="handleEdit(template)"
        >
          <template #icon>
            <PencilIcon class="w-4 h-4" />
          </template>
        </Button>

        <Button
          variant="text"
          icon-only
          size="sm"
          class="!text-danger"
          :loading="deletingTemplateId === template.id"
          :disabled="deletingTemplateId === template.id"
          @click="handleDelete(template.id)"
        >
          <template #icon>
            <TrashIcon class="w-4 h-4" />
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>
