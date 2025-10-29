<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Modal from "@src/ui/modals/Modal.vue";
import Button from "@src/ui/inputs/Button.vue";
import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import AutocompleteSelect from "@src/ui/inputs/AutocompleteSelect.vue";
import {
  contactsService,
  type CreateContactRequest,
  type UpdateContactRequest,
} from "@src/api/contacts-service";
import { useToast } from "@src/shared/composables/useToast";
import useGlobalDataStore from "@src/shared/store/global-data-store";
import { extractValidationErrors } from "@src/shared/utils/utils";
import { CONTRAGENT_TO_ENTITY_MAP } from "@src/shared/types/common";
import type { ApiCommunicationLead, ApiContact } from "@src/api/types";
import { useConversationsStore } from "@src/features/conversations/conversations-store";
import { useRouter } from "vue-router";
import { useForm } from "vee-validate";
import * as z from "zod";

interface Props {
  open: boolean;
  closeModal: () => void;
  entityType: "client" | "lead" | "supplier";
  entityId: number;
  mode: "create" | "edit";
  contact?: ApiContact | null;
}

interface Emits {
  (e: "contactAdded", contact: ApiCommunicationLead): void;
  (e: "contactUpdated"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { toastError, toastSuccess } = useToast();
const globalDataStore = useGlobalDataStore();
const conversationsStore = useConversationsStore();
const router = useRouter();

const isLoading = ref(false);

const schema = z
  .object({
    fio: z.string().min(1, "*обов'язкове поле"),
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
    jobTitleId: z.union([z.string(), z.number()]),
  })
  .superRefine((data, ctx) => {
    const hasAtLeastOne =
      (data.email && data.email.trim() !== "") ||
      (data.phone && data.phone.trim() !== "") ||
      (data.tgName && data.tgName.trim() !== "");

    if (!hasAtLeastOne) {
      ctx.addIssue({
        code: "custom",
        message: "*заповніть: пошту, телефон або tg",
        path: ["email"],
      });
      ctx.addIssue({
        code: "custom",
        message: "*заповніть: пошту, телефон або tg",
        path: ["phone"],
      });
      ctx.addIssue({
        code: "custom",
        message: "*заповніть: пошту, телефон або tg",
        path: ["tgName"],
      });
    }
  });

const { defineField, handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema: schema,
  initialValues: {
    fio: "",
    email: "",
    phone: "",
    tgName: "",
    jobTitleId: "",
  },
});

const [fio] = defineField("fio");
const [email] = defineField("email");
const [phone] = defineField("phone");
const [tgName] = defineField("tgName");
const [jobTitleIdField] = defineField("jobTitleId");

const selectedJobTitleId = computed<string | number>({
  get: () => jobTitleIdField.value || "",
  set: (value) => {
    jobTitleIdField.value = value;
  },
});

watch(
  () => [props.contact, props.open] as const,
  ([contact, open]) => {
    if (
      open &&
      props.mode === "edit" &&
      contact &&
      typeof contact === "object"
    ) {
      setValues({
        fio: contact.fio || "",
        email: contact.email || "",
        phone: contact.phone || "",
        tgName: contact.tg_name || "",
        jobTitleId: contact.post_id || "",
      });
    } else if (open && props.mode === "create") {
      resetForm();
    }
  },
  { immediate: true },
);

const clean = () => {
  resetForm();
  props.closeModal();
};

const onSubmit = handleSubmit(async (values) => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;

    const contactData: CreateContactRequest | UpdateContactRequest = {
      fio: values.fio.trim(),
      phone: values.phone?.trim() || "",
      email: values.email?.trim() || "",
      tg_name: values.tgName?.trim() || "",
    };

    if (props.entityType === "client" || props.entityType === "supplier") {
      contactData.post_id = values.jobTitleId || "";
    }

    const entityTypeForStore = CONTRAGENT_TO_ENTITY_MAP[props.entityType];

    if (props.mode === "create") {
      const contactResponse = await contactsService.addContactToEntity(
        entityTypeForStore,
        props.entityId,
        contactData as CreateContactRequest,
      );

      if (!contactResponse?.id) {
        throw new Error("Invalid response from server");
      }

      const entityData: ApiCommunicationLead = {
        ...contactResponse,
        messages: contactResponse.messages || [],
      };

      conversationsStore.addNewConversation(entityTypeForStore, entityData);

      emit("contactAdded", contactResponse);
      clean();

      if (contactResponse.contacts && contactResponse.contacts.length > 0) {
        const newContact =
          contactResponse.contacts[contactResponse.contacts.length - 1];
        await router.push({
          name: "Chat",
          params: {
            entity: entityTypeForStore,
            id: props.entityId.toString(),
            contactId: newContact.id.toString(),
          },
        });
      }

      toastSuccess("Контакт успішно додано");
    } else {
      if (!props.contact) {
        throw new Error("Contact is required for edit mode");
      }

      await contactsService.updateContact(
        entityTypeForStore,
        props.entityId,
        props.contact.id,
        contactData as UpdateContactRequest,
      );

      if (conversationsStore.activeConversation?.id === props.entityId) {
        await conversationsStore.fetchConversation(
          entityTypeForStore,
          props.entityId,
        );
      }

      emit("contactUpdated");
      clean();

      toastSuccess("Контакт успішно оновлено");
    }
  } catch (error) {
    console.error(
      `Error ${props.mode === "create" ? "adding" : "updating"} contact:`,
      error,
    );
    toastError(extractValidationErrors(error));
  } finally {
    isLoading.value = false;
  }
});

const handleCancel = () => {
  clean();
};

const jobTitleOptions = computed(() => {
  return globalDataStore.contactJobTitles.map((jobTitle) => ({
    value: jobTitle.id,
    label: jobTitle.name,
  }));
});

const modalTitle = computed(() => {
  return props.mode === "create" ? "Додати контакт" : "Редагувати контакт";
});

const submitButtonText = computed(() => {
  if (isLoading.value) {
    return props.mode === "create" ? "Додавання..." : "Збереження...";
  }
  return props.mode === "create" ? "Додати контакт" : "Зберегти зміни";
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
            {{ modalTitle }}
          </h2>
        </div>

        <!-- Form -->
        <div class="space-y-0 xs:space-y-3">
          <template
            v-if="
              props.entityType === 'client' || props.entityType === 'supplier'
            "
          >
            <div class="grid xs:grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4">
              <LabeledTextInput
                v-model="fio"
                label="ФИО"
                placeholder="Іван Іванов"
                bordered
                name="fio"
                :error="errors.fio"
                :disabled="isLoading"
              />
              <AutocompleteSelect
                v-model="selectedJobTitleId"
                :options="jobTitleOptions"
                label="Посада"
                placeholder="Оберіть посаду..."
                variant="bordered"
                searchable
                name="jobTitleId"
                :error="errors.jobTitleId"
              />
            </div>

            <div class="grid xs:grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4">
              <LabeledTextInput
                v-model="email"
                label="E-mail"
                type="email"
                placeholder="example@mail.com"
                bordered
                name="email"
                :error="errors.email"
                :disabled="isLoading"
              />
              <LabeledTextInput
                v-model="phone"
                label="Телефон"
                type="tel"
                placeholder="+380123456789"
                bordered
                name="phone"
                :error="errors.phone"
                :disabled="isLoading"
              />
            </div>

            <div class="grid xs:grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4">
              <LabeledTextInput
                v-model="tgName"
                label="Профіль в Telegram"
                placeholder="@tg_name"
                bordered
                name="tgName"
                :error="errors.tgName"
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
                name="fio"
                :error="errors.fio"
                :disabled="isLoading"
              />
              <LabeledTextInput
                v-model="email"
                label="E-mail"
                type="email"
                placeholder="example@mail.com"
                bordered
                name="email"
                :error="errors.email"
                :disabled="isLoading"
              />
            </div>

            <div class="grid xs:grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4">
              <LabeledTextInput
                v-model="phone"
                label="Телефон"
                type="tel"
                placeholder="+380123456789"
                bordered
                name="phone"
                :error="errors.phone"
                :disabled="isLoading"
              />
              <LabeledTextInput
                v-model="tgName"
                label="Профіль в Telegram"
                placeholder="@tg_name"
                bordered
                name="tgName"
                :error="errors.tgName"
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
            Скасувати
          </Button>

          <Button
            :loading="isLoading"
            class="xs:order-1 md:order-2"
            @click="onSubmit"
          >
            {{ submitButtonText }}
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
