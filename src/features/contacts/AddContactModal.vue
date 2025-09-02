<script setup lang="ts">
import { ref, computed } from "vue";
import Modal from "@src/ui/modals/Modal.vue";
import Button from "@src/ui/inputs/Button.vue";
import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import {
  contactsService,
  type CreateContactRequest,
} from "@src/api/contacts-service";
import { toast, type ToastOptions } from "vue3-toastify";
import useStore from "@src/shared/store/store";
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

const isLoading = ref(false);

const fio = ref("");
const phone = ref("");
const email = ref("");

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
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template #content>
      <div class="w-[32rem] bg-app-bg rounded-lg p-6">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-app-text dark:text-white">
            Додати контакт
          </h2>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
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
        </div>

        <div class="flex justify-end mt-6 space-x-3">
          <Button variant="text" @click="handleCancel"> Відмінити </Button>

          <Button
            :disabled="!isFormValid || isLoading"
            :loading="isLoading"
            @click="handleSubmit"
          >
            Додати контакт
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
