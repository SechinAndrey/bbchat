import { defineStore } from "pinia";
import { ref } from "vue";
import { messagesTemplatesService } from "./messages-templates-service";
import { globalDataService } from "@src/shared/services/global-data-service";
import type { MessageTemplate } from "./types";
import type {
  ApiDefaultMessageCategory,
  ApiDefaultMessage,
} from "@src/api/types";

/**
 * Store for managing message templates
 */
export const useMessagesTemplatesStore = defineStore(
  "messagesTemplates",
  () => {
    const templates = ref<MessageTemplate[]>([]);
    const categories = ref<ApiDefaultMessageCategory[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const mapApiMessageToTemplate = (
      msg: ApiDefaultMessage,
    ): MessageTemplate => ({
      id: msg.id,
      text: msg.message,
      created_at: msg.created_at,
      updated_at: msg.updated_at,
      category_id: msg.category_id,
    });

    /**
     * Fetch all message templates from API (via GlobalDataService)
     */
    const fetchTemplates = async () => {
      isLoading.value = true;
      error.value = null;

      try {
        const data = await globalDataService.getGlobalData();
        categories.value = data.defaultMessagesCategories || [];

        // Flatten messages from all categories
        const allMessages = categories.value.flatMap(
          (cat) => cat.messages || [],
        );
        templates.value = allMessages
          .map(mapApiMessageToTemplate)
          .sort((a, b) => b.id - a.id);
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
        let categoryId: number;

        // Check if we have any categories, if not create one
        if (categories.value.length > 0) {
          categoryId = categories.value[0].id;
        } else {
          const newCategory = await messagesTemplatesService.createCategory({
            name: "Загальна",
          });
          categories.value.push(newCategory);
          categoryId = newCategory.id;
        }

        const newTemplate = await messagesTemplatesService.createTemplate({
          category_id: categoryId,
          message: text,
        });

        const mappedTemplate = mapApiMessageToTemplate(newTemplate);
        templates.value.unshift(mappedTemplate);

        // Also update the category in local state to include the new message
        const categoryIndex = categories.value.findIndex(
          (c) => c.id === categoryId,
        );
        if (categoryIndex !== -1) {
          if (!categories.value[categoryIndex].messages) {
            categories.value[categoryIndex].messages = [];
          }
          categories.value[categoryIndex].messages.push(newTemplate);
        }

        return mappedTemplate;
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
        const existingTemplate = templates.value.find((t) => t.id === id);
        if (!existingTemplate || !existingTemplate.category_id) {
          throw new Error("Template or category_id not found");
        }

        await messagesTemplatesService.updateTemplate(id, {
          message: text,
          category_id: existingTemplate.category_id,
        });

        const updatedTemplate: MessageTemplate = {
          ...existingTemplate,
          text: text,
          updated_at: new Date().toISOString(),
        };

        const index = templates.value.findIndex((t) => t.id === id);
        if (index !== -1) {
          templates.value[index] = updatedTemplate;
        }

        // Update in categories as well
        categories.value.forEach((cat) => {
          if (cat.messages) {
            const msgIndex = cat.messages.findIndex((m) => m.id === id);
            if (msgIndex !== -1) {
              cat.messages[msgIndex] = {
                ...cat.messages[msgIndex],
                message: text,
                updated_at: updatedTemplate.updated_at || "",
              };
            }
          }
        });

        return updatedTemplate;
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
        await messagesTemplatesService.deleteTemplate(id);
        templates.value = templates.value.filter((t) => t.id !== id);

        // Remove from categories
        categories.value.forEach((cat) => {
          if (cat.messages) {
            cat.messages = cat.messages.filter((m) => m.id !== id);
          }
        });
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
      categories.value = [];
      isLoading.value = false;
      error.value = null;
    };

    return {
      templates,
      categories,
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
