<script setup lang="ts">
import { ref, computed } from "vue";
import Modal from "@src/ui/modals/Modal.vue";
import Button from "@src/ui/inputs/Button.vue";
import AutocompleteSelect from "@src/ui/inputs/AutocompleteSelect.vue";
import useGlobalDataStore from "@src/shared/store/global-data-store";
import leadActionsService, {
  type LeadActionType,
} from "@src/shared/services/lead-actions-service";
import { useToast } from "@src/shared/composables/useToast";

const props = defineProps<{
  open: boolean;
  closeModal: () => void;
  actionType: LeadActionType;
  leadName?: string;
  leadId: number | string;
}>();

const selectedItemId = ref<string | number>("");
const isLoading = ref(false);

const globalDataStore = useGlobalDataStore();
const { toastSuccess, toastError } = useToast();

const actionConfig = computed(() => {
  switch (props.actionType) {
    case "lead":
      return {
        title: "Додати до існуючого ліда",
        subtitle: `Лід "${props.leadName}" буде доданий до обраного ліда`,
        placeholder: "Виберіть ліда",
        label: "Лід",
        successMessage: "Ліди успішно об'єднані",
      };
    case "client":
      return {
        title: "Додати до існуючого клієнта",
        subtitle: `Лід "${props.leadName}" буде доданий до обраного клієнта`,
        placeholder: "Виберіть клієнта",
        label: "Клієнт",
        successMessage: "Лід успішно доданий до клієнта",
      };
    case "supplier":
      return {
        title: "Додати до існуючого постачальника",
        subtitle: `Лід "${props.leadName}" буде доданий до обраного постачальника`,
        placeholder: "Виберіть постачальника",
        label: "Постачальник",
        successMessage: "Лід успішно доданий до постачальника",
      };
    case "manager":
      return {
        title: "Змінити менеджера",
        subtitle: `Змінити менеджера для ліда "${props.leadName}"`,
        placeholder: "Виберіть менеджера",
        label: "Менеджер",
        successMessage: "Менеджера успішно змінено",
      };
    default:
      return {
        title: "",
        subtitle: "",
        placeholder: "",
        label: "",
        successMessage: "",
      };
  }
});

const options = computed(() => {
  switch (props.actionType) {
    case "lead":
      return (
        globalDataStore.globalData?.leads.map((lead) => ({
          value: lead.id,
          label: `#${lead.id} ${lead.name}`,
        })) || []
      );
    case "client":
      return (
        globalDataStore.globalData?.clients.map((client) => ({
          value: client.id,
          label: `#${client.id} ${client.name}`,
        })) || []
      );
    case "supplier":
      return (
        globalDataStore.globalData?.suppliers.map((supplier) => ({
          value: supplier.id,
          label: `#${supplier.id} ${supplier.name}`,
        })) || []
      );
    case "manager":
      return (
        globalDataStore.globalData?.users.map((user) => ({
          value: user.id,
          label: `#${user.id} ${user.name}`,
        })) || []
      );
    default:
      return [];
  }
});

const isFormValid = computed(() => {
  return selectedItemId.value !== "" && !isLoading.value;
});

const clean = () => {
  selectedItemId.value = "";
  isLoading.value = false;
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    return;
  }

  const selectedOption = options.value.find(
    (opt) => opt.value === selectedItemId.value,
  );

  if (!selectedOption) {
    return;
  }

  isLoading.value = true;

  try {
    const response = await leadActionsService.executeAction(
      props.actionType,
      props.leadId,
      selectedItemId.value,
    );

    console.log("Lead action response:", response);

    if (response.status === 200) {
      // TODO: update url after ufter successful action
      toastSuccess(actionConfig.value.successMessage);
      close();
    }
  } catch (error) {
    toastError("Помилка, щось пішло не так");
    console.error("Lead action error:", error);
  } finally {
    isLoading.value = false;
  }
};

const close = () => {
  clean();
  props.closeModal();
};
</script>

<template>
  <Modal :open="props.open" :close-modal="close">
    <template #content>
      <div
        class="w-full max-w-[32rem] xs:w-full xs:max-w-none bg-app-bg xs:rounded-none md:rounded-lg p-4 xs:p-6 md:p-6"
      >
        <div class="mb-4 xs:mb-6">
          <div class="flex items-center gap-3 mb-2">
            <h2
              class="text-lg xs:text-xl font-semibold text-app-text dark:text-white"
            >
              {{ actionConfig.title }}
            </h2>
          </div>
          <p class="text-sm mt-5">
            {{ actionConfig.subtitle }}
          </p>
        </div>

        <div class="space-y-3 xs:space-y-4">
          <AutocompleteSelect
            v-model="selectedItemId"
            :options="options"
            :label="actionConfig.label"
            :placeholder="actionConfig.placeholder"
            :disabled="isLoading"
            variant="bordered"
            searchable
          />
        </div>

        <div
          class="flex xs:flex-col md:flex-row xs:gap-3 md:justify-end md:space-x-3 mt-4 xs:mt-6"
        >
          <Button variant="text" class="xs:order-2 md:order-1" @click="close">
            Скасувати
          </Button>

          <Button
            :disabled="!isFormValid"
            :loading="isLoading"
            class="xs:order-1 md:order-2"
            @click="handleSubmit"
          >
            Підтвердити
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
