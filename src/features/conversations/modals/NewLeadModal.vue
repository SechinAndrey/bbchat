<script setup lang="ts">
import { ref, computed, type Ref } from "vue";
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

import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

const globalDataStore = useGlobalDataStore();
const cityOptions = computed(() => {
  return globalDataStore.cities.map((city) => ({
    value: city.id,
    label: city.name,
  }));
});

const statusId = ref<number>(3);

const schema = toTypedSchema(
  z
    .object({
      name: z.string().min(1, "*обов'язкове поле"),
      fio: z.string().min(1, "*обов'язкове поле"),
      city: z
        .union([z.string(), z.number()])
        .refine((val) => val !== "" && val !== null && val !== undefined, {
          message: "*обов'язкове поле",
        }),
      email: z
        .string()
        .refine(
          (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
          "Невірний формат email",
        ),
      phone: z
        .string()
        .refine(
          (val) => !val || /^\+?[\d\s\-()]{7,}$/.test(val),
          "Невірний формат телефону",
        ),
      tgName: z.string(),
      comment: z.string(),
    })
    .superRefine((data, ctx) => {
      const hasAtLeastOne =
        (data.email && data.email.trim() !== "") ||
        (data.phone && data.phone.trim() !== "") ||
        (data.tgName && data.tgName.trim() !== "");

      if (!hasAtLeastOne) {
        ctx.addIssue({
          code: "custom",
          message: "*зповніть: пошту, телефон або tg",
          path: ["email"],
        });
        ctx.addIssue({
          code: "custom",
          message: "*зповніть: пошту, телефон або tg",
          path: ["phone"],
        });
        ctx.addIssue({
          code: "custom",
          message: "*зповніть: пошту, телефон або tg",
          path: ["tgName"],
        });
      }
    }),
);

const { defineField, handleSubmit, errors, meta, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: "",
    fio: "",
    city: "",
    email: "",
    phone: "",
    tgName: "",
    comment: "",
  },
});

const [name] = defineField("name");
const [fio] = defineField("fio");
const [cityField] = defineField("city");
const [email] = defineField("email");
const [phone] = defineField("phone");
const [tgName] = defineField("tgName");
const [comment] = defineField("comment");

const city = computed<string | number>({
  get: () => cityField.value || "",
  set: (value) => {
    cityField.value = value;
  },
});

const onSubmit = handleSubmit((values) => {
  const leadData: CreateLeadRequest = {
    name: values.name.trim(),
    fio: values.fio.trim(),
    email: values.email?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    tg_name: values.tgName?.trim() || undefined,
    city: values.city ? [values.city as number] : [],
    comment: values.comment?.trim() || undefined,
    status_id: statusId.value,
  };

  emit("submit", leadData);
  handleCancel();
});

const handleCancel = () => {
  resetForm();
  statusId.value = 3;
  props.closeModal();
};
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template #content>
      <div
        class="w-full max-w-[32rem] xs:w-full xs:max-w-none bg-app-bg xs:rounded-none md:rounded-lg p-4 xs:p-6 md:p-6"
      >
        <!-- Header -->
        <div class="mb-4 xs:mb-6">
          <h2
            class="text-lg xs:text-xl font-semibold text-app-text dark:text-white"
          >
            Додати ліда
          </h2>
        </div>

        <!-- Form -->
        <div class="space-y-0 xs:space-y-3">
          <!-- Name and FIO -->
          <div class="grid xs:grid-cols-1 md:grid-cols-2 gap-3">
            <LabeledTextInput
              v-model="name"
              name="name"
              label="Найменування"
              placeholder="Binotel #2234"
              :error="errors.name"
              bordered
            />
            <LabeledTextInput
              v-model="fio"
              name="fio"
              label="Ім'я"
              placeholder="Іван Іванов"
              :error="errors.fio"
              bordered
            />
          </div>

          <!-- Email and Phone -->
          <div class="grid xs:grid-cols-1 md:grid-cols-2 gap-3">
            <LabeledTextInput
              v-model="email"
              name="email"
              label="E-mail"
              type="email"
              placeholder="example@mail.com"
              :error="errors.email"
              bordered
            />
            <LabeledTextInput
              v-model="phone"
              name="phone"
              label="Телефон"
              type="tel"
              placeholder="+380123456789"
              :error="errors.phone"
              bordered
            />
          </div>

          <!-- Telegram Profile and City -->
          <div class="grid xs:grid-cols-1 md:grid-cols-2 gap-3">
            <LabeledTextInput
              v-model="tgName"
              name="tgName"
              label="Профіль в Telegram"
              placeholder="@tg_name"
              :error="errors.tgName"
              bordered
            />
            <AutocompleteSelect
              v-model="city"
              :options="cityOptions"
              label="Місто"
              placeholder="Виберіть місто"
              variant="bordered"
              name="city"
              :error="errors.city"
              searchable
            />
          </div>

          <!-- Comment -->
          <div>
            <label class="mb-2 xs:mb-3 block text-left text-sm xs:text-base"
              >Коментар</label
            >
            <Textarea
              v-model="comment"
              name="comment"
              placeholder="Ваш коментар"
              variant="bordered"
              :error="errors.comment"
              bordered
              auto-resize
              :rows="4"
            />
          </div>
        </div>

        <!-- Action buttons -->
        <div
          class="flex xs:flex-col md:flex-row xs:gap-3 md:justify-end md:space-x-3 mt-4 xs:mt-6"
        >
          <Button
            variant="text"
            class="xs:order-2 md:order-1"
            @click="handleCancel"
          >
            Скасувати
          </Button>

          <Button class="xs:order-1 md:order-2" @click="onSubmit">
            Створити лід
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
