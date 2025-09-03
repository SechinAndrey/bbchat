<script setup lang="ts">
import { ref, computed } from "vue";
import Modal from "@src/ui/modals/Modal.vue";
import Button from "@src/ui/inputs/Button.vue";
import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import AutocompleteSelect from "@src/ui/inputs/AutocompleteSelect.vue";
import {
  contactsService,
  type CreateContactRequest,
} from "@src/api/contacts-service";
import { toast, type ToastOptions } from "vue3-toastify";
import useStore from "@src/shared/store/store";
import useGlobalDataStore from "@src/shared/store/global-data-store";
import { extractValidationErrors } from "@src/shared/utils/utils";

interface Props {
  open: boolean;
  closeModal: () => void;
  entityType: "client" | "lead";
  entityId: number;
}

interface Emits {
  (e: "contactAdded"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const store = useStore();
const globalDataStore = useGlobalDataStore();

const isLoading = ref(false);

const fio = ref("");
const phone = ref("");
const email = ref("");
const selectedJobTitleId = ref<number | string>("");

const isFormValid = computed(() => {
  const isFioValid = fio.value.trim() !== "";
  const isPhoneValid = phone.value.trim() !== "";
  const isEmailValid =
    email.value.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);

  return isFioValid && isPhoneValid && isEmailValid;
});

const clean = () => {
  fio.value = "";
  phone.value = "";
  email.value = "";
  selectedJobTitleId.value = "";
  props.closeModal();
};

const handleSubmit = async () => {
  if (!isFormValid.value || isLoading.value) return;

  try {
    isLoading.value = true;

    const contactData: CreateContactRequest = {
      fio: fio.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
    };

    if (
      props.entityType === "client" &&
      selectedJobTitleId.value &&
      typeof selectedJobTitleId.value === "number"
    ) {
      contactData.post_id = selectedJobTitleId.value;
    }

    if (props.entityType === "client") {
      await contactsService.addContactToClient(props.entityId, contactData);
    } else {
      await contactsService.addContactToLead(props.entityId, contactData);
    }

    emit("contactAdded");
    clean();
  } catch (error) {
    console.error("Error adding contact:", error);
    toast(extractValidationErrors(error), {
      autoClose: 2000,
      type: "error",
      position: toast.POSITION.BOTTOM_RIGHT,
      theme: store.settings.darkMode ? "dark" : "light",
    } as ToastOptions);
  } finally {
    isLoading.value = false;
  }
};

const handleCancel = () => {
  clean();
};

const jobTitleOptions = computed(() => {
  return globalDataStore.contactJobTitles.map((jobTitle) => ({
    value: jobTitle.id,
    label: jobTitle.name,
  }));
});
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template #content>
      <div
        class="w-full max-w-[32rem] xs:w-full xs:max-w-none bg-app-bg xs:rounded-none md:rounded-lg p-4 xs:p-6 md:p-6"
      >
        <div class="mb-4 xs:mb-6">
          <h2
            class="text-lg xs:text-xl font-semibold text-app-text dark:text-white"
          >
            Додати контакт
          </h2>
        </div>

        <!-- Form -->
        <div class="space-y-3 xs:space-y-4">
          <template v-if="props.entityType === 'client'">
            <div class="grid xs:grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4">
              <LabeledTextInput
                v-model="fio"
                label="ФИО"
                placeholder="Іван Іванов"
                bordered
                :disabled="isLoading"
              />
              <AutocompleteSelect
                v-model="selectedJobTitleId"
                :options="jobTitleOptions"
                label="Посада"
                placeholder="Оберіть посаду..."
                variant="bordered"
                searchable
              />
            </div>

            <div class="grid xs:grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4">
              <LabeledTextInput
                v-model="phone"
                label="Телефон"
                type="tel"
                placeholder="+380123456789"
                bordered
                :disabled="isLoading"
              />
              <LabeledTextInput
                v-model="email"
                label="E-mail"
                type="email"
                placeholder="example@mail.com"
                bordered
                :disabled="isLoading"
              />
            </div>
          </template>

          <template v-else>
            <div class="grid xs:grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4">
              <LabeledTextInput
                v-model="fio"
                label="ФИО"
                placeholder="Іван Іванов"
                bordered
                :disabled="isLoading"
              />
              <LabeledTextInput
                v-model="phone"
                label="Телефон"
                type="tel"
                placeholder="+380123456789"
                bordered
                :disabled="isLoading"
              />
            </div>

            <div>
              <LabeledTextInput
                v-model="email"
                label="E-mail"
                type="email"
                placeholder="example@mail.com"
                bordered
                :disabled="isLoading"
              />
            </div>
          </template>
        </div>

        <div
          class="flex xs:flex-col md:flex-row xs:gap-3 md:justify-end md:space-x-3 mt-4 xs:mt-6"
        >
          <Button
            variant="text"
            class="xs:order-2 md:order-1"
            @click="handleCancel"
          >
            Відмінити
          </Button>

          <Button
            :disabled="!isFormValid || isLoading"
            :loading="isLoading"
            class="xs:order-1 md:order-2"
            @click="handleSubmit"
          >
            Додати контакт
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
