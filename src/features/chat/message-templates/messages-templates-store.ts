import { defineStore } from "pinia";
import { ref } from "vue";
import { messagesTemplatesService } from "./messages-templates-service";
import type { MessageTemplate } from "./types";

const MOCK_TEMPLATES: MessageTemplate[] = [
  {
    id: 1,
    text: "Доброго дня! Дякуємо за звернення. Ми обов'язково зв'яжемося з вами найближчим часом.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    text: "Вітаю! Ваше замовлення прийнято в обробку. Очікуйте на дзвінок менеджера протягом години.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    text: "Дякуємо за ваш відгук! Ми цінуємо кожного клієнта і завжди прагнемо покращувати наш сервіс.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const USE_MOCK_DATA = true;

/**
 * Store for managing message templates
 */
export const useMessagesTemplatesStore = defineStore(
  "messagesTemplates",
  () => {
    const templates = ref<MessageTemplate[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    /**
     * Fetch all message templates from API
     */
    const fetchTemplates = async () => {
      isLoading.value = true;
      error.value = null;

      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          templates.value = [...MOCK_TEMPLATES];
        } else {
          templates.value = await messagesTemplatesService.getTemplates();
        }
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Failed to fetch templates";
        console.error("Error fetching templates:", err);
      } finally {
        isLoading.value = false;
      }
    };

    /**
     * Create a new message template
     * @param text - Template text
     */
    const createTemplate = async (text: string) => {
      isLoading.value = true;
      error.value = null;

      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const newTemplate: MessageTemplate = {
            id: Date.now(),
            text,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          templates.value.push(newTemplate);
          return newTemplate;
        } else {
          const newTemplate = await messagesTemplatesService.createTemplate({
            text,
          });
          templates.value.push(newTemplate);
          return newTemplate;
        }
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Failed to create template";
        console.error("Error creating template:", err);
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    /**
     * Update an existing message template
     * @param id - Template ID
     * @param text - Updated template text
     */
    const updateTemplate = async (id: number, text: string) => {
      isLoading.value = true;
      error.value = null;

      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const index = templates.value.findIndex((t) => t.id === id);
          if (index !== -1) {
            templates.value[index] = {
              ...templates.value[index],
              text,
              updated_at: new Date().toISOString(),
            };
            return templates.value[index];
          }
          throw new Error("Template not found");
        } else {
          const updatedTemplate = await messagesTemplatesService.updateTemplate(
            id,
            { text },
          );

          const index = templates.value.findIndex((t) => t.id === id);
          if (index !== -1) {
            templates.value[index] = updatedTemplate;
          }

          return updatedTemplate;
        }
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Failed to update template";
        console.error("Error updating template:", err);
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    /**
     * Delete a message template
     * @param id - Template ID
     */
    const deleteTemplate = async (id: number) => {
      isLoading.value = true;
      error.value = null;

      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          templates.value = templates.value.filter((t) => t.id !== id);
        } else {
          await messagesTemplatesService.deleteTemplate(id);
          templates.value = templates.value.filter((t) => t.id !== id);
        }
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Failed to delete template";
        console.error("Error deleting template:", err);
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    const resetState = () => {
      templates.value = [];
      isLoading.value = false;
      error.value = null;
    };

    return {
      templates,
      isLoading,
      error,

      fetchTemplates,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      resetState,
    };
  },
);
