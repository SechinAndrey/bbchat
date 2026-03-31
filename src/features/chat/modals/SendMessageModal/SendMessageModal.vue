<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Modal from "@src/ui/modals/Modal.vue";
import Select from "@src/ui/inputs/Select.vue";
import AutocompleteSelect from "@src/ui/inputs/AutocompleteSelect.vue";
import Textarea from "@src/ui/inputs/Textarea.vue";
import Button from "@src/ui/inputs/Button.vue";
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import {
  BookmarkIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/vue/24/outline";
import {
  TemplateSelectorModal,
  useMessagesTemplatesStore,
} from "@src/features/chat/message-templates";
import type { MessageTemplate } from "@src/features/chat/message-templates";
import { useSendMessageModal } from "./useSendMessageModal";
import { buildMessengerOptions } from "./buildMessengerOptions";
import type { ApiContact, ApiCommunicationEntityFull } from "@src/api/types";
import { isApiSendMessageError } from "@src/api/types";
import type { ContragentType } from "@src/shared/types/common";
import { CONTRAGENT_TO_ENTITY_MAP } from "@src/shared/types/common";
import conversationsService from "@src/features/conversations/conversations-service";
import useGlobalDataStore from "@src/shared/store/global-data-store";
import { useToast } from "@src/shared/composables/useToast";

const { isOpen, params, close } = useSendMessageModal();
const globalDataStore = useGlobalDataStore();
const templatesStore = useMessagesTemplatesStore();
const { toastError, toastSuccess } = useToast();

// Internal state
const selectedEntityType = ref<ContragentType | null>(null);
const selectedEntityId = ref<number | null>(null);
const selectedContactId = ref<number | null>(null);
const selectedMessengerId = ref<number | null>(null);
const messageText = ref("");
const contacts = ref<ApiContact[]>([]);
const isLoadingContacts = ref(false);
const contactsError = ref<string | null>(null);
const contactSearch = ref("");
const showEmojiPicker = ref(false);
const showTemplateSelector = ref(false);
const isSending = ref(false);
const validationErrors = ref<{
  contact?: string;
  messenger?: string;
  message?: string;
}>({});

// Refs for textarea DOM access
const textareaRef = ref<InstanceType<typeof Textarea> | null>(null);

// Entity type options
const entityTypeOptions = [
  { value: "lead" as ContragentType, label: "Лід" },
  { value: "client" as ContragentType, label: "Клієнт" },
  { value: "supplier" as ContragentType, label: "Підрядник" },
];

// Effective values: from params or from manual selection
const effectiveEntityType = computed(
  () => params.value?.entityType ?? selectedEntityType.value,
);
const effectiveEntityId = computed(
  () => params.value?.entityId ?? selectedEntityId.value,
);

// Visibility computed properties: ui-config takes priority over default logic
const showEntityTypeSelect = computed(
  () => params.value?.ui?.showEntityTypeSelect ?? !params.value?.entityType,
);
const showEntitySelect = computed(
  () =>
    params.value?.ui?.showEntitySelect ??
    (!!effectiveEntityType.value && !params.value?.entityId),
);
const showContactSelect = computed(
  () => params.value?.ui?.showContactSelect ?? !!effectiveEntityId.value,
);
const showMessengerSelect = computed(
  () => params.value?.ui?.showMessengerSelect ?? true,
);
const showEmojiButton = computed(
  () => params.value?.ui?.showEmojiButton ?? true,
);
const showTemplateButton = computed(
  () => params.value?.ui?.showTemplateButton ?? true,
);

const entityPlaceholder = computed(() => {
  if (effectiveEntityType.value === "lead") return "Виберіть ліда";
  if (effectiveEntityType.value === "client") return "Виберіть клієнта";
  return "Виберіть підрядника";
});

// Entity options for AutocompleteSelect based on selected type
const entityOptions = computed(() => {
  const type = effectiveEntityType.value;
  if (!type) return [];
  const data = globalDataStore.globalData;
  if (!data) return [];
  const items = data[`${type}s` as "leads" | "clients" | "suppliers"] ?? [];
  return items.map((item) => ({
    value: item.id,
    label: `#${item.id} ${item.name}`,
  }));
});

// Filtered contacts based on search query
const filteredContacts = computed(() => {
  const q = contactSearch.value.trim().toLowerCase();
  if (!q) return contacts.value;
  return contacts.value.filter((c) => {
    const name = (c.fio || "").toLowerCase();
    const phone = (c.phone || "").toLowerCase();
    const tg = (c.tg_name || "").toLowerCase();
    return name.includes(q) || phone.includes(q) || tg.includes(q);
  });
});

// Contact initials for avatar fallback
const getContactInitials = (contact: ApiContact) => {
  const first = contact.firstName?.[0] || "";
  const last = contact.lastName?.[0] || "";
  return (first + last).toUpperCase() || contact.fio?.[0]?.toUpperCase() || "?";
};

// Reset all internal state
const resetState = () => {
  selectedEntityType.value = null;
  selectedEntityId.value = null;
  selectedContactId.value = null;
  selectedMessengerId.value = null;
  messageText.value = "";
  contacts.value = [];
  isLoadingContacts.value = false;
  contactsError.value = null;
  contactSearch.value = "";
  showEmojiPicker.value = false;
  showTemplateSelector.value = false;
  validationErrors.value = {};
};

// Reset state when modal closes
watch(isOpen, (val) => {
  if (!val) {
    resetState();
  }
});

// Re-initialize form when open() is called again (params changes)
watch(
  params,
  (newParams) => {
    resetState();
    messageText.value = newParams?.messageTemplate || "";
  },
  { immediate: false },
);

// When entityType changes manually, reset dependent state
watch(selectedEntityType, () => {
  selectedEntityId.value = null;
  contacts.value = [];
  selectedContactId.value = null;
  selectedMessengerId.value = null;
});

// Load contacts when both effectiveEntityType and effectiveEntityId are known
const loadContacts = async () => {
  const type = effectiveEntityType.value;
  const id = effectiveEntityId.value;
  if (!type || !id) return;

  isLoadingContacts.value = true;
  contactsError.value = null;

  try {
    const entityType = CONTRAGENT_TO_ENTITY_MAP[type];
    const data =
      await conversationsService.getConversationById<ApiCommunicationEntityFull>(
        entityType,
        id,
      );
    contacts.value = data.contacts ?? [];
  } catch {
    contactsError.value = "Помилка завантаження контактів";
  } finally {
    isLoadingContacts.value = false;
  }
};

watch([effectiveEntityType, effectiveEntityId], ([type, id]) => {
  if (type && id) {
    loadContacts();
  } else {
    contacts.value = [];
  }
});

// Computed: currently selected contact object
const selectedContact = computed(
  () => contacts.value.find((c) => c.id === selectedContactId.value) ?? null,
);

// Computed: messenger options based on selected contact
const messengerOptions = computed(() =>
  buildMessengerOptions(selectedContact.value),
);

// Auto-select messenger when options change (contact changes or contacts load)
const autoSelectMessenger = () => {
  const requestedId = params.value?.messengerId ?? null;
  const available = messengerOptions.value.find(
    (o) => o.value === requestedId && !o.disabled,
  );
  if (available) {
    selectedMessengerId.value = available.value;
  } else {
    const first = messengerOptions.value.find((o) => !o.disabled);
    selectedMessengerId.value = first?.value ?? null;
  }
};

// When contacts finish loading, pre-select contact by params.contactId
watch(
  () => contacts.value,
  (newContacts) => {
    if (newContacts.length === 0) return;
    const contactId = params.value?.contactId ?? null;
    if (contactId && newContacts.some((c) => c.id === contactId)) {
      selectedContactId.value = contactId;
    }
  },
);

// When selected contact changes: reset messenger and auto-select
watch(selectedContactId, () => {
  selectedMessengerId.value = null;
  autoSelectMessenger();
});

// Select contact from card click — messenger auto-selects via watcher
const selectContact = (contactId: number) => {
  selectedContactId.value = contactId;
  validationErrors.value.contact = undefined;
  validationErrors.value.messenger = undefined;
};

// Template selection: replace textarea content
const handleTemplateSelect = (template: MessageTemplate) => {
  messageText.value = template.text;
  showTemplateSelector.value = false;
};

// Send handler with validation and direct API call
const handleSend = async () => {
  validationErrors.value = {};

  if (selectedContactId.value === null) {
    validationErrors.value.contact = "Виберіть контакт";
  }

  const selectedMessengerOption = messengerOptions.value.find(
    (o) => o.value === selectedMessengerId.value,
  );
  if (selectedMessengerId.value === null || selectedMessengerOption?.disabled) {
    validationErrors.value.messenger = "Виберіть доступний мессенджер";
  }

  if (!messageText.value.trim()) {
    validationErrors.value.message = "Введіть текст повідомлення";
  }

  if (
    validationErrors.value.contact ||
    validationErrors.value.messenger ||
    validationErrors.value.message
  ) {
    return;
  }

  const contact = selectedContact.value!;
  const messengerId = selectedMessengerId.value!;
  const message = messageText.value.trim();

  // Telegram: prefer tg_name if no phone (same logic as useMessageSending)
  let phone = contact.phone || "";
  if (messengerId === 1 && contact.tg_name) {
    phone = contact.phone || contact.tg_name;
  }

  const clientMessageUid = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  isSending.value = true;
  try {
    const response = await conversationsService.sendMessage({
      phone,
      message,
      messenger_id: messengerId,
      contragent_type: effectiveEntityType.value!,
      contragent_id: effectiveEntityId.value!,
      contragent_contact_id: selectedContactId.value!,
      client_message_uid: clientMessageUid,
    });

    if (isApiSendMessageError(response)) {
      toastError(response.description || "Помилка відправки повідомлення");
      return;
    }

    toastSuccess("Повідомлення відправлено");
    params.value?.onSent?.({
      contactId: selectedContactId.value!,
      messengerId,
      message,
    });
    close();
  } catch {
    toastError("Помилка відправки повідомлення");
  } finally {
    isSending.value = false;
  }
};
</script>

<template>
  <Modal :open="isOpen" :close-modal="close">
    <template #content>
      <div
        class="w-full md:min-w-[40rem] max-w-[52rem] xs:w-full xs:max-w-none bg-app-bg xs:rounded-none md:rounded-xl overflow-hidden"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 py-4 border-b border-app-border"
        >
          <h2 class="text-base font-semibold text-app-text">
            Надіслати повідомлення
          </h2>
          <Button
            variant="ghost"
            size="xs"
            icon-only
            :ring="false"
            @click="close"
          >
            <template #icon>
              <XMarkIcon class="w-4 h-4" />
            </template>
          </Button>
        </div>

        <!-- Body -->
        <div class="px-5 py-4 flex flex-col gap-3">
          <!-- Entity type select -->
          <div v-if="showEntityTypeSelect" class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-app-text-secondary"
              >Тип контрагента</label
            >
            <Select
              :model-value="selectedEntityType ?? ''"
              :options="entityTypeOptions"
              placeholder="Виберіть тип"
              :icon="false"
              size="sm"
              @update:model-value="
                selectedEntityType = ($event as ContragentType) || null
              "
            />
          </div>

          <!-- Entity autocomplete select -->
          <div v-if="showEntitySelect" class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-app-text-secondary"
              >Контрагент</label
            >
            <AutocompleteSelect
              :model-value="selectedEntityId ?? ''"
              :options="entityOptions"
              :placeholder="entityPlaceholder"
              searchable
              block
              variant="bordered"
              @update:model-value="
                selectedEntityId = ($event as number) || null
              "
            />
          </div>

          <!-- Contacts section: search + grid -->
          <div v-if="showContactSelect" class="flex flex-col gap-2">
            <!-- Search field -->
            <div class="relative mb-3">
              <MagnifyingGlassIcon
                class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-secondary pointer-events-none"
              />
              <input
                v-model="contactSearch"
                type="text"
                placeholder="Пошук контакту..."
                class="w-full pl-8 pr-3 py-2 rounded-lg border border-app-border bg-app-bg-secondary text-sm text-app-text placeholder:text-app-text-secondary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <!-- Loading state -->
            <div
              v-if="isLoadingContacts"
              class="flex items-center gap-2 py-3 text-sm text-app-text-secondary"
            >
              <Spinner class="w-4 h-4 flex-shrink-0" />
              <span>Завантаження контактів...</span>
            </div>

            <!-- Error state -->
            <div
              v-else-if="contactsError"
              class="flex items-center gap-2 text-sm text-danger"
            >
              {{ contactsError }}
              <button class="underline" type="button" @click="loadContacts">
                Повторити
              </button>
            </div>

            <!-- Contacts grid -->
            <div
              v-else
              class="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-0.5"
            >
              <div
                v-if="filteredContacts.length === 0"
                class="col-span-3 sm:col-span-4 text-sm text-center text-app-text-secondary py-6"
              >
                Контактів не знайдено
              </div>

              <div
                v-for="contact in filteredContacts"
                :key="contact.id"
                class="rounded-sm border p-2 cursor-pointer transition-colors"
                :class="
                  selectedContactId === contact.id
                    ? 'border-primary'
                    : 'border-app-border bg-app-bg-secondary hover:bg-app-bg'
                "
                @click="selectContact(contact.id)"
              >
                <!-- Avatar + name row -->
                <div class="flex items-center gap-3 min-w-0">
                  <!-- Avatar -->
                  <div
                    class="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden bg-primary flex items-center justify-center"
                  >
                    <img
                      v-if="contact.avatar"
                      :src="contact.avatar"
                      :alt="contact.fio"
                      class="w-full h-full object-cover"
                    />
                    <span
                      v-else
                      class="text-xs font-semibold text-app-text leading-none"
                    >
                      {{ getContactInitials(contact) }}
                    </span>
                  </div>
                  <!-- Name -->
                  <p
                    class="text-sm font-medium text-app-text truncate leading-snug"
                  >
                    {{ contact.fio || "—" }}
                  </p>
                </div>

                <!-- Phone -->
                <p
                  v-if="contact.phone"
                  class="text-xs text-app-text-secondary truncate mt-2 leading-snug"
                >
                  {{ contact.phone }}
                </p>

                <!-- Telegram tag -->
                <p
                  v-if="contact.tg_name"
                  class="text-xs text-app-text-secondary truncate leading-snug mt-2"
                >
                  @{{ contact.tg_name }}
                </p>
              </div>
            </div>

            <!-- Messenger chips (always rendered to avoid layout jump) -->
            <div
              v-if="showMessengerSelect"
              class="flex flex-wrap gap-2 pt-1 min-h-[2.25rem] mt-3"
            >
              <button
                v-for="opt in messengerOptions"
                :key="opt.value"
                type="button"
                :disabled="opt.disabled"
                :title="opt.title || opt.label"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all"
                :class="[
                  opt.disabled
                    ? 'opacity-30 cursor-not-allowed border-app-border text-app-text-secondary'
                    : selectedMessengerId === opt.value
                      ? 'border-primary bg-primary-light text-primary cursor-pointer'
                      : 'border-app-border text-app-text hover:border-primary cursor-pointer',
                ]"
                @click="!opt.disabled && (selectedMessengerId = opt.value)"
              >
                <img
                  :src="opt.image"
                  :alt="opt.label"
                  class="w-4 h-4 object-contain"
                />
                {{ opt.label }}
              </button>
            </div>

            <!-- Validation errors for contact / messenger -->
            <p
              v-if="validationErrors.contact || validationErrors.messenger"
              class="text-xs text-danger"
            >
              {{ validationErrors.contact || validationErrors.messenger }}
            </p>
          </div>

          <!-- Message textarea -->
          <div class="flex flex-col gap-1.5 mt-4">
            <label
              class="text-left text-xs font-medium text-app-text-secondary flex items-center gap-1.5"
            >
              Повідомлення для:
              <template v-if="selectedContact && selectedMessengerId">
                <img
                  :src="
                    messengerOptions.find(
                      (o) => o.value === selectedMessengerId,
                    )?.image
                  "
                  :alt="
                    messengerOptions.find(
                      (o) => o.value === selectedMessengerId,
                    )?.label
                  "
                  class="w-3.5 h-3.5 object-contain flex-shrink-0"
                />
                <span class="text-app-text">{{ selectedContact.fio }}</span>
              </template>
            </label>

            <div class="relative">
              <Textarea
                ref="textareaRef"
                v-model="messageText"
                placeholder="Введіть повідомлення..."
                variant="filled"
                :rows="6"
                extendable
                :max-rows="6"
                :class="
                  showTemplateButton || showEmojiButton ? 'pr-[4.5rem]' : ''
                "
                @keydown.ctrl.enter.exact.prevent="handleSend"
              />

              <!-- Template button -->
              <div
                v-if="showTemplateButton"
                class="absolute bottom-[0.375rem] right-3"
              >
                <Button
                  variant="ghost"
                  size="xs"
                  :ring="false"
                  icon-only
                  title="Вибрати шаблон"
                  @click="showTemplateSelector = true"
                >
                  <template #icon>
                    <BookmarkIcon class="w-5 h-5" />
                  </template>
                </Button>
              </div>
            </div>
            <p v-if="validationErrors.message" class="text-xs text-danger">
              {{ validationErrors.message }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-end gap-3 px-5 py-4 border-t border-app-border"
        >
          <Button variant="text" :disabled="isSending" @click="close">
            Скасувати
          </Button>
          <Button
            variant="primary"
            :loading="isSending"
            :disabled="
              isSending ||
              isLoadingContacts ||
              !selectedContactId ||
              !selectedMessengerId ||
              !messageText.trim()
            "
            @click="handleSend"
          >
            Надіслати
          </Button>
        </div>
      </div>
    </template>
  </Modal>

  <TemplateSelectorModal
    :templates="templatesStore.templates"
    :open="showTemplateSelector"
    @select="handleTemplateSelect"
    @close="showTemplateSelector = false"
  />
</template>
