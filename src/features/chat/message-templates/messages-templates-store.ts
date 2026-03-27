import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { messagesTemplatesService } from "./messages-templates-service";
import { globalDataService } from "@src/shared/services/global-data-service";
import type { MessageTemplate } from "./types";
import type {
  ApiDefaultMessageCategory,
  ApiDefaultMessage,
} from "@src/api/types";

const GENERAL_CATEGORY_NAME = "Загальна";

export const useMessagesTemplatesStore = defineStore(
  "messagesTemplates",
  () => {
    const categories = ref<ApiDefaultMessageCategory[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const mapMessage = (
      msg: ApiDefaultMessage,
      cat: ApiDefaultMessageCategory,
    ): MessageTemplate => ({
      id: msg.id,
      text: msg.message,
      created_at: msg.created_at,
      updated_at: msg.updated_at,
      category_id: msg.category_id,
      category_name: cat.name,
      disable_delete: !!msg.disable_delete,
    });

    // Flat list of all templates — для ChatBottom и TemplatePickerList
    const templates = computed(() =>
      categories.value
        .flatMap((cat) =>
          (cat.messages || []).map((msg) => mapMessage(msg, cat)),
        )
        .sort((a, b) => b.id - a.id),
    );

    const generalTemplates = computed(() =>
      categories.value
        .filter((cat) => cat.name === GENERAL_CATEGORY_NAME)
        .flatMap((cat) =>
          (cat.messages || []).map((msg) => mapMessage(msg, cat)),
        )
        .sort((a, b) => b.id - a.id),
    );

    const systemTemplates = computed(() =>
      categories.value
        .filter((cat) => cat.name !== GENERAL_CATEGORY_NAME)
        .flatMap((cat) =>
          (cat.messages || []).map((msg) => mapMessage(msg, cat)),
        )
        .sort((a, b) => b.id - a.id),
    );

    const fetchTemplates = async () => {
      isLoading.value = true;
      error.value = null;
      try {
        const data = await globalDataService.getGlobalData();
        categories.value = data.defaultMessagesCategories || [];
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Failed to fetch templates";
        console.error("Error fetching templates:", err);
      } finally {
        isLoading.value = false;
      }
    };

    const createTemplate = async (text: string) => {
      isLoading.value = true;
      error.value = null;
      try {
        let generalCat = categories.value.find(
          (c) => c.name === GENERAL_CATEGORY_NAME,
        );
        if (!generalCat) {
          generalCat = await messagesTemplatesService.createCategory({
            name: GENERAL_CATEGORY_NAME,
          });
          categories.value.push(generalCat);
        }

        const newMsg = await messagesTemplatesService.createTemplate({
          category_id: generalCat.id,
          message: text,
        });

        const cat = categories.value.find((c) => c.id === generalCat!.id)!;
        if (!cat.messages) cat.messages = [];
        cat.messages.push(newMsg);

        return mapMessage(newMsg, cat);
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Failed to create template";
        console.error("Error creating template:", err);
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    const updateTemplate = async (id: number, text: string) => {
      isLoading.value = true;
      error.value = null;
      try {
        for (const cat of categories.value) {
          const msgIndex = (cat.messages || []).findIndex((m) => m.id === id);
          if (msgIndex === -1) continue;

          await messagesTemplatesService.updateTemplate(id, {
            message: text,
            category_id: cat.id,
          });

          cat.messages[msgIndex] = {
            ...cat.messages[msgIndex],
            message: text,
            updated_at: new Date().toISOString(),
          };
          return mapMessage(cat.messages[msgIndex], cat);
        }
        throw new Error("Template not found");
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Failed to update template";
        console.error("Error updating template:", err);
        throw err;
      } finally {
        isLoading.value = false;
      }
    };

    const deleteTemplate = async (id: number) => {
      isLoading.value = true;
      error.value = null;
      try {
        await messagesTemplatesService.deleteTemplate(id);
        for (const cat of categories.value) {
          if (cat.messages) {
            cat.messages = cat.messages.filter((m) => m.id !== id);
          }
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
      categories.value = [];
      isLoading.value = false;
      error.value = null;
    };

    return {
      categories,
      templates,
      generalTemplates,
      systemTemplates,
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
