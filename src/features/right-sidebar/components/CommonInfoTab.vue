<script setup lang="ts">
import { computed, inject, ref, type Ref } from "vue";
import {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
  ApiCommunicationSupplierFull,
} from "@src/api/types";
import Button from "@src/ui/inputs/Button.vue";
import TextInput from "@src/ui/inputs/TextInput.vue";
import { formatConversationDate } from "@src/shared/utils/utils";
import useConversationsStore from "@src/features/conversations/conversations-store";
import { useRouter } from "vue-router";
import {
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  PencilIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  BriefcaseIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/vue/24/outline";
import KanbanSelect from "@src/shared/components/KanbanSelect.vue";
import ContactModal from "@src/features/contacts/ContactModal.vue";
import DeleteContactModal from "@src/features/contacts/modals/DeleteContactModal.vue";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import useStore from "@src/shared/store/store";
import { useToast } from "@src/shared/composables/useToast";
import TgLineIcon from "@src/shared/icons/TgLineIcon.vue";
import type { ApiContact } from "@src/api/types";
import VuePopper from "@kalimahapps/vue-popper";

const contactId = inject<Ref<number> | undefined>("contactId");
const entity = inject<Ref<"leads" | "clients" | "suppliers">>("entity");

const authStore = useAuthStore();
const store = useStore();
const router = useRouter();
const { toastError } = useToast();

const conversationsStore = useConversationsStore();
const isContactModalOpen = ref(false);
const contactModalMode = ref<"create" | "edit">("create");
const editingContact = ref<ApiContact | null>(null);
const isEditingComment = ref(false);
const editCommentValue = ref("");
const isSavingComment = ref(false);
const isDeleteModalOpen = ref(false);
const contactToDelete = ref<ApiContact | null>(null);
const isDeletingContact = ref(false);

const activeConversation = computed<
  | ApiCommunicationLeadFull
  | ApiCommunicationClientFull
  | ApiCommunicationSupplierFull
  | null
>(() => {
  return conversationsStore.activeConversation;
});

const entityType = computed(() => {
  if (activeConversation.value?.entity === "clients") return "client";
  if (activeConversation.value?.entity === "suppliers") return "supplier";
  return "lead";
});

const isClient = computed(() => {
  return entity?.value === "clients";
});

const clientCrnLink = computed(() => {
  if (!activeConversation.value) return "#";

  return `${import.meta.env.VITE_CRM_BASE}/manager/clients/${activeConversation.value.id}/view`;
});

const entityId = computed(() => {
  return activeConversation.value?.id || 0;
});

const entityName = computed(() => {
  return activeConversation.value?.name || "";
});

const isCurrentContact = (contact: { id: number }) => {
  return contactId?.value && contact.id === contactId.value;
};

const isLastContact = computed(() => {
  return (activeConversation.value?.contacts?.length || 0) <= 1;
});

const openAddContactModal = () => {
  contactModalMode.value = "create";
  editingContact.value = null;
  isContactModalOpen.value = true;
};

const openEditContactModal = (contact: ApiContact) => {
  contactModalMode.value = "edit";
  editingContact.value = contact;
  isContactModalOpen.value = true;
};

const closeContactModal = () => {
  isContactModalOpen.value = false;
  editingContact.value = null;
};

const handleContactAdded = () => {
  closeContactModal();
};

const handleContactUpdated = () => {
  closeContactModal();
};

const startEditingComment = () => {
  editCommentValue.value = activeConversation.value?.comment || "";
  isEditingComment.value = true;
};

const cancelEditingComment = () => {
  isEditingComment.value = false;
  editCommentValue.value = "";
};

const saveComment = async () => {
  if (!activeConversation.value || entity?.value !== "leads") return;

  try {
    isSavingComment.value = true;

    const leadData = {
      name: activeConversation.value.name,
      fio: activeConversation.value.fio || undefined,
      email: activeConversation.value.email || undefined,
      phone: activeConversation.value.phone || undefined,
      tg_name: activeConversation.value.tg_name || undefined,
      city:
        activeConversation.value.cities?.map((city) => city.id) || undefined,
      comment: editCommentValue.value,
      status_id: activeConversation.value.status_id || undefined,
    };

    await conversationsStore.updateLead(activeConversation.value.id, leadData);

    if (activeConversation.value) {
      activeConversation.value.comment = editCommentValue.value;
    }

    isEditingComment.value = false;
  } catch (error) {
    console.error("Error updating comment:", error);
  } finally {
    isSavingComment.value = false;
  }
};

const openChatWithContact = async (contactIdToOpen: number) => {
  if (!activeConversation.value || !entity?.value) {
    toastError("Не вдалося відкрити чат");
    return;
  }

  const entityType = entity.value;
  const entityId = activeConversation.value.id;

  try {
    const existingConversation = conversationsStore.conversations[
      entityType
    ]?.find(
      (conv) => conv.id === entityId && conv.contact.id === contactIdToOpen,
    );

    if (existingConversation) {
      await router.push({
        name: store.isWidget ? "Widget-Chat" : "Chat",
        params: {
          entity: entityType,
          id: entityId.toString(),
          contactId: contactIdToOpen.toString(),
        },
      });
    } else {
      const loadedConversation =
        await conversationsStore.loadMissingConversation(
          entityType,
          entityId,
          contactIdToOpen,
        );

      if (loadedConversation) {
        await router.push({
          name: store.isWidget ? "Widget-Chat" : "Chat",
          params: {
            entity: entityType,
            id: entityId.toString(),
            contactId: contactIdToOpen.toString(),
          },
        });
      } else {
        toastError("Не вдалося завантажити чат");
      }
    }
  } catch (err) {
    console.error("Error opening chat with contact:", err);
    toastError("Помилка при відкритті чату");
  }
};

const openDeleteContactModal = (contact: ApiContact) => {
  contactToDelete.value = contact;
  isDeleteModalOpen.value = true;
};

const closeDeleteContactModal = () => {
  isDeleteModalOpen.value = false;
  contactToDelete.value = null;
};

const handleDeleteContact = async () => {
  if (!contactToDelete.value || !entity?.value || !activeConversation.value) {
    return;
  }

  const contactIdToDelete = contactToDelete.value.id;
  const isCurrentContact = contactId?.value === contactIdToDelete;

  try {
    isDeletingContact.value = true;

    await conversationsStore.deleteContact(
      entity.value,
      activeConversation.value.id,
      contactIdToDelete,
    );

    closeDeleteContactModal();

    // If deleted current contact - redirect to next available contact
    if (isCurrentContact) {
      // Find next contact after deletion
      const remainingContacts = activeConversation.value.contacts.filter(
        (c) => c.id !== contactIdToDelete,
      );

      if (remainingContacts.length > 0) {
        // Redirect to first remaining contact
        await router.push({
          name: store.isWidget ? "Widget-Chat" : "Chat",
          params: {
            entity: entity.value,
            id: activeConversation.value.id.toString(),
            contactId:
              remainingContacts[remainingContacts.length - 1].id.toString(),
          },
        });
      } else {
        // No contacts left - redirect to chat list
        const url = store.isWidget
          ? `/widget/${entity.value}/${activeConversation.value.id}`
          : `/chat/${entity.value}`;
        await router.push({ path: url });
      }
    }
  } catch (error) {
    console.error("Error deleting contact:", error);
    toastError("Не вдалося видалити контакт");
  } finally {
    isDeletingContact.value = false;
  }
};

const sourceInfo = computed(() => {
  try {
    return JSON.parse(activeConversation.value?.info || "{}");
  } catch (error) {
    console.error("Error parsing info:", error);
    return {};
  }
});
</script>

<template>
  <div class="py-4 pb-6">
    <a
      v-if="isClient"
      :href="clientCrnLink"
      target="_blank"
      class="text-[0.813rem] text-primary my-4 flex items-start hover:underline underline-offset-[0.4rem]"
    >
      <ArrowTopRightOnSquareIcon class="min-w-5 min-h-5 max-w-5 max-h-5 mr-2" />
      <div class="-mt-[0.07rem]">{{ entityName }} в CRM</div>
    </a>

    <div class="common-info-tab mb-4 text-app-text-secondary text-[0.813rem]">
      Контакти
    </div>

    <div
      v-for="contact in activeConversation?.contacts"
      :key="contact.id"
      class="common-info-tab__contact-item relative last:mb-0 border-b border-t border-dashed border-app-border py-3"
      :class="{
        'border-primary common-info-tab__contact-item--current':
          isCurrentContact(contact),
      }"
    >
      <div class="absolute bottom-[0.6rem] right-0">
        <VuePopper placement="bottom-end" :show-arrow="false">
          <Button
            variant="ghost"
            size="xs"
            :ring="false"
            icon-only
            :title="`Дії з контактом`"
          >
            <template #icon>
              <EllipsisVerticalIcon class="w-4 h-4 text-primary" />
            </template>
          </Button>

          <template #content>
            <ul>
              <li>
                <Button
                  block
                  variant="text"
                  @click="openEditContactModal(contact)"
                >
                  <PencilIcon class="h-5 w-5 mr-3" />
                  Редагувати
                </Button>
              </li>
              <li>
                <Button
                  block
                  variant="text"
                  class="!text-danger"
                  :disabled="isLastContact"
                  :title="
                    isLastContact
                      ? 'Неможливо видалити останній контакт'
                      : 'Видалити контакт'
                  "
                  @click="openDeleteContactModal(contact)"
                >
                  <TrashIcon class="h-5 w-5 mr-3" />
                  Видалити
                </Button>
              </li>
            </ul>
          </template>
        </VuePopper>
      </div>

      <Button
        v-if="!isCurrentContact(contact)"
        variant="ghost"
        size="xs"
        :ring="false"
        icon-only
        class="absolute top-[0.438rem] right-0"
        :title="`Відкрити чат з ${contact.fio || 'контактом'}`"
        @click="openChatWithContact(contact.id)"
      >
        <template #icon>
          <ChatBubbleLeftIcon class="w-4 h-4 text-primary" />
        </template>
      </Button>

      <div
        :class="[
          'flex items-center gap-2 mb-2 pr-6',
          { 'pr-[2.75rem]': isCurrentContact(contact) },
        ]"
      >
        <UserIcon class="w-5 h-5 text-primary flex-shrink-0" />
        <span class="text-[0.875rem] truncate">{{
          contact.fio || "Не вказано"
        }}</span>
      </div>

      <div v-if="contact?.post_name" class="flex items-center gap-2 mb-2">
        <BriefcaseIcon class="w-5 h-5 text-primary flex-shrink-0" />
        <span class="text-[0.875rem] truncate">{{
          contact.post_name || "Не вказано"
        }}</span>
      </div>

      <div class="flex items-center gap-2 mb-2">
        <PhoneIcon class="w-5 h-5 text-primary" />
        <a
          class="text-[0.875rem] hover:underline underline-offset-4"
          :href="`tel:${contact.phone}`"
        >
          {{ contact.phone || "Не вказаний" }}
        </a>
      </div>

      <div class="flex items-center gap-2 mb-2">
        <EnvelopeIcon class="w-5 h-5 text-primary flex-shrink-0" />
        <a
          class="text-[0.875rem] hover:underline underline-offset-4 truncate"
          :href="`mailto:${contact?.email}`"
        >
          {{ contact?.email || "Не вказана" }}
        </a>
      </div>

      <div class="flex items-center gap-2 mb-2">
        <TgLineIcon class="w-5 h-5 text-primary flex-shrink-0" />
        <span class="text-[0.875rem] truncate">
          {{ contact?.tg_name || "Не вказаний" }}
        </span>
      </div>
    </div>

    <Button variant="text" class="mt-3 ml-2 !px-3" @click="openAddContactModal">
      <template #icon>
        <PlusIcon class="w-5 h-5" />
      </template>
      Додати
    </Button>

    <div class="my-4 text-app-text-secondary text-[0.813rem]">Створено</div>

    <div class="text-[0.875rem]">
      {{
        formatConversationDate(activeConversation?.created_at) || "Не вказано"
      }}
    </div>

    <div class="my-4 text-app-text-secondary text-[0.813rem]">Канал</div>

    <div class="text-[0.875rem]">
      {{ activeConversation?.channel || "Не вказано" }}
    </div>

    <div class="my-4 text-app-text-secondary text-[0.813rem]">Місто</div>
    <div v-if="activeConversation?.cities.length" class="text-[0.875rem]">
      <div v-for="city in activeConversation?.cities || []" :key="city.id">
        {{ city.name_ua }}
      </div>
    </div>
    <div v-else class="text-[0.875rem]">Не вказано</div>

    <div class="my-4 text-app-text-secondary text-[0.813rem]">Коментар</div>

    <div v-if="!isEditingComment" class="flex items-start gap-2 group">
      <div class="text-[0.875rem] flex-1">
        {{ activeConversation?.comment || "Не вказано" }}
      </div>

      <Button
        v-if="entity === 'leads'"
        variant="ghost"
        size="xs"
        :ring="false"
        icon-only
        class="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        @click="startEditingComment"
      >
        <template #icon>
          <PencilIcon class="w-4 h-4 text-primary" />
        </template>
      </Button>
    </div>

    <div v-else class="space-y-3">
      <TextInput
        v-model="editCommentValue"
        placeholder="Введіть коментар"
        size="sm"
        class="px-2"
      />
      <div class="flex justify-end gap-2 pr-2">
        <Button
          size="xs"
          class="px-3"
          variant="text"
          @click="cancelEditingComment"
        >
          Скасувати
        </Button>

        <Button
          :disabled="isSavingComment"
          size="xs"
          class="px-3"
          variant="primary"
          @click="saveComment"
        >
          {{ isSavingComment ? "Збереження..." : "Зберегти" }}
        </Button>
      </div>
    </div>

    <div
      v-if="
        authStore.currentUser?.roleId === 1 &&
        (sourceInfo.utm || sourceInfo.page)
      "
    >
      <hr class="my-5 border-app-border" />

      <div
        v-if="sourceInfo.utm"
        class="my-4 text-app-text-secondary text-[0.813rem]"
      >
        Utm
      </div>

      <div v-if="sourceInfo.utm" class="text-[0.875rem] flex-1">
        {{ sourceInfo.utm }}
      </div>

      <div
        v-if="sourceInfo?.page?.title || sourceInfo?.page?.url"
        class="my-4 text-app-text-secondary text-[0.813rem]"
      >
        Сторінка
      </div>

      <div v-if="sourceInfo?.page?.title" class="text-[0.875rem] flex-1">
        {{ sourceInfo.page.title || "Не вказано" }}
      </div>

      <br v-if="sourceInfo?.page?.url" />

      <div
        v-if="sourceInfo?.page?.url"
        class="text-[0.875rem] flex-1 break-all"
      >
        {{ sourceInfo.page.url || "Не вказано" }}
      </div>
    </div>

    <hr v-if="entity === 'leads'" class="my-5 border-app-border" />

    <div
      v-if="entity === 'leads'"
      class="my-4 text-app-text-secondary text-[0.813rem]"
    >
      Kanban статус
    </div>

    <div v-if="entity === 'leads'">
      <KanbanSelect />
    </div>

    <hr
      v-if="activeConversation?.status_log?.length"
      class="my-5 border-app-border"
    />

    <div
      v-if="activeConversation?.status_log?.length"
      class="my-4 text-app-text-secondary text-[0.813rem]"
    >
      Історія статусів
    </div>

    <div
      v-for="status in activeConversation?.status_log || []"
      :key="status.id"
      class="mb-4 text-[0.813rem]"
    >
      <div class="flex gap-4 mb-4">
        <div class="text-app-text-secondary">
          {{ formatConversationDate(status.created_at) }}
        </div>
        <div class="flex-1 min-w-full">
          <div>{{ status.new_status.name }}</div>
          <div class="text-app-text-secondary">{{ status.user?.name }}</div>
        </div>
      </div>
    </div>

    <ContactModal
      :open="isContactModalOpen"
      :close-modal="closeContactModal"
      :entity-type="entityType"
      :entity-id="entityId"
      :mode="contactModalMode"
      :contact="editingContact"
      @contact-added="handleContactAdded"
      @contact-updated="handleContactUpdated"
    />

    <DeleteContactModal
      :open="isDeleteModalOpen"
      :contact="contactToDelete"
      :is-loading="isDeletingContact"
      @confirm="handleDeleteContact"
      @cancel="closeDeleteContactModal"
    />
  </div>
</template>

<style scoped lang="scss">
.common-info-tab {
  &__contact-item {
    > div:last-child {
      padding-right: 1.5rem;
    }

    &--current {
      position: relative;

      &::before {
        content: "Поточний";
        position: absolute;
        top: 0;
        right: 0;
        color: var(--color-primary);
        background: var(--color-bg-primary);
        font-size: 0.6rem;
        font-weight: 500;
        padding: 0.1rem 0.2rem;
        border-bottom-left-radius: 0.375rem;
        border-bottom-right-radius: 0.375rem;
        z-index: 10;
        border: 1px dashed var(--color-primary);
        white-space: nowrap;
        border-top: none;
      }
    }
  }
}
</style>
