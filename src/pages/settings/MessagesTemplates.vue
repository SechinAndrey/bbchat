<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  useMessagesTemplatesStore,
  TemplateMessagesForm,
  TemplateMessagesList,
  type MessageTemplate,
} from "@src/features/chat/message-templates";
import Button from "@src/ui/inputs/Button.vue";
import Tabs from "@src/ui/navigation/Tabs/Tabs.vue";
import Tab from "@src/ui/navigation/Tabs/Tab.vue";
import { ChevronLeftIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
const templatesStore = useMessagesTemplatesStore();

const editingTemplate = ref<MessageTemplate | null>(null);
const isSaving = ref(false);
const deletingTemplateId = ref<number | null>(null);

type TabKey = "general" | "system";
const activeTab = ref<TabKey>("general");

const goBack = () => {
  router.push({ name: "Settings" });
};

const handleSave = async (text: string) => {
  isSaving.value = true;
  try {
    if (editingTemplate.value) {
      await templatesStore.updateTemplate(editingTemplate.value.id, text);
      editingTemplate.value = null;
    } else {
      await templatesStore.createTemplate(text);
    }
  } finally {
    isSaving.value = false;
  }
};

const handleCancel = () => {
  editingTemplate.value = null;
};

const handleEdit = (template: MessageTemplate) => {
  editingTemplate.value = template;
};

const handleDelete = async (templateId: number) => {
  deletingTemplateId.value = templateId;
  try {
    await templatesStore.deleteTemplate(templateId);
  } finally {
    deletingTemplateId.value = null;
  }
};

const switchTab = (tab: TabKey) => {
  activeTab.value = tab;
  editingTemplate.value = null;
};

onMounted(() => {
  templatesStore.fetchTemplates();
});
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div
      class="w-full max-h-fit px-5 py-3 pt-5 md:pt-5 md:pb-3 flex gap-4 items-center"
    >
      <Button class="md:!hidden" variant="text" icon-only @click="goBack">
        <template #icon>
          <ChevronLeftIcon class="w-[1.25rem] h-[1.25rem]" />
        </template>
      </Button>
      <h1 class="text-xl">Шаблони повідомлень</h1>
    </div>

    <!-- Tabs -->
    <div class="px-5 pb-2">
      <Tabs :gap="2" class="bg-app-bg-secondary">
        <Tab
          name="Загальні"
          :active="activeTab === 'general'"
          inactive-class="!bg-app-bg"
          @click="switchTab('general')"
        />
        <Tab
          name="Системні"
          :active="activeTab === 'system'"
          inactive-class="!bg-app-bg"
          @click="switchTab('system')"
        />
      </Tabs>
    </div>

    <!-- Content -->
    <div class="p-5 flex-1 overflow-y-auto scrollbar-thin--bg-app-bg">
      <!-- Загальні tab -->
      <template v-if="activeTab === 'general'">
        <TemplateMessagesForm
          class="mt-4"
          :editing-template="editingTemplate"
          :loading="isSaving"
          @save="handleSave"
          @cancel="handleCancel"
        />

        <TemplateMessagesList
          class="mt-8"
          :templates="templatesStore.generalTemplates"
          :deleting-template-id="deletingTemplateId"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </template>

      <!-- Системні tab -->
      <template v-else>
        <TemplateMessagesForm
          v-show="editingTemplate"
          class="mt-4"
          :editing-template="editingTemplate"
          :show-add-button="false"
          :loading="isSaving"
          @save="handleSave"
          @cancel="handleCancel"
        />

        <TemplateMessagesList
          class="mt-4"
          :templates="templatesStore.systemTemplates"
          :deleting-template-id="deletingTemplateId"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </template>
    </div>
  </div>
</template>
