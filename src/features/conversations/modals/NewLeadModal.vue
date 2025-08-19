<script setup lang="ts">
import { ref, computed } from "vue";
import Button from "@src/ui/inputs/Button.vue";
import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import AutocompleteSelect from "@src/ui/inputs/AutocompleteSelect.vue";
import Textarea from "@src/ui/inputs/Textarea.vue";
import Modal from "@src/ui/modals/Modal.vue";
import type { CreateLeadRequest } from "@src/api/types";
import useGlobalDataStore from "@src/shared/store/global-data-store";

const props = defineProps<{
  open: boolean;
  closeModal: () => void;
}>();

const emit = defineEmits<{
  submit: [leadData: CreateLeadRequest];
}>();

// Form fields
const name = ref("");
const fio = ref("");
const email = ref("");
const phone = ref("");
const tgName = ref("");
const comment = ref("");
const statusId = ref<number>(3);

const globalDataStore = useGlobalDataStore();
const cityOptions = computed(() => {
  return globalDataStore.cities.map((city) => ({
    value: city.id,
    label: city.name,
  }));
});

const selectedCityId = ref<string | number>("");

const isFormValid = computed(() => {
  const isNameValid = name.value.trim() !== "";
  const isFioValid = fio.value.trim() !== "";

  // Email validation (optional)
  const isEmailValid =
    !email.value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);

  // Phone validation (optional)
  const isPhoneValid = !phone.value || /^\+?[\d\s\-()]{7,}$/.test(phone.value);

  return isNameValid && isFioValid && isEmailValid && isPhoneValid;
});

const clean = () => {
  name.value = "";
  fio.value = "";
  email.value = "";
  phone.value = "";
  tgName.value = "";
  selectedCityId.value = "";
  comment.value = "";
  statusId.value = 3;
  props.closeModal();
};

const handleSubmit = () => {
  if (!isFormValid.value) {
    return;
  }

  const leadData: CreateLeadRequest = {
    name: name.value.trim(),
    fio: fio.value.trim(),
    email: email.value.trim() || undefined,
    phone: phone.value.trim() || undefined,
    tg_name: tgName.value.trim() || undefined,
    city: selectedCityId.value ? [selectedCityId.value as number] : [],
    comment: comment.value.trim() || undefined,
    status_id: statusId.value,
  };

  emit("submit", leadData);
  clean();
};

const handleCancel = () => {
  clean();
};
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template #content>
      <div class="w-[32rem] bg-white dark:bg-gray-800 rounded-lg p-6">
        <!-- Header -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Додати ліда
          </h2>
        </div>

        <!-- Form -->
        <div class="space-y-4">
          <!-- Name and FIO -->
          <div class="grid grid-cols-2 gap-4">
            <LabeledTextInput
              v-model="name"
              label="Найменування"
              placeholder="Binotel #2234"
              bordered
            />
            <LabeledTextInput
              v-model="fio"
              label="Ім'я"
              placeholder="Іван Іванов"
              bordered
            />
          </div>

          <!-- Email and Phone -->
          <div class="grid grid-cols-2 gap-4">
            <LabeledTextInput
              v-model="email"
              label="E-mail"
              type="email"
              placeholder="example@mail.com"
              bordered
            />
            <LabeledTextInput
              v-model="phone"
              label="Телефон"
              type="tel"
              placeholder="+380123456789"
              bordered
            />
          </div>

          <!-- Telegram Profile and City -->
          <div class="grid grid-cols-2 gap-4">
            <LabeledTextInput
              v-model="tgName"
              label="Профіль в Telegram"
              placeholder="@tg_name"
              bordered
            />
            <AutocompleteSelect
              v-model="selectedCityId"
              :options="cityOptions"
              label="Місто"
              placeholder="Виберіть місто"
              variant="bordered"
              searchable
            />
          </div>

          <!-- Comment -->
          <div>
            <label class="mb-3 block text-left">Коментар</label>
            <Textarea
              v-model="comment"
              placeholder="Ваш коментар"
              variant="bordered"
              bordered
              auto-resize
              :rows="5"
            />
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end mt-6 space-x-3">
          <Button variant="text" @click="handleCancel"> Відмінити </Button>

          <Button :disabled="!isFormValid" @click="handleSubmit">
            Створити лід
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
