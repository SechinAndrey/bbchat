import { computed, ref, watch, type Ref } from "vue";
import { useRoute } from "vue-router";
import useConversationsStore from "@src/features/conversations/conversations-store";
import type {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
  ApiCommunicationSupplierFull,
  ApiMessageItem,
  ApiContact,
} from "@src/api/types";

export type MessengerOption = {
  value: number;
  label: string;
  description?: string;
  image: string;
  disabled?: boolean;
  title?: string;
};

export function useMessenger() {
  const conversationsStore = useConversationsStore();
  const route = useRoute();

  const messengerId: Ref<number> = ref(1);

  const activeConversation = computed<
    | ApiCommunicationLeadFull
    | ApiCommunicationClientFull
    | ApiCommunicationSupplierFull
    | null
  >(() => {
    return conversationsStore.activeConversation;
  });

  const lastMessage = computed<ApiMessageItem | null>(() => {
    if (!activeConversation.value) return null;
    const messages = activeConversation.value.messages;
    return messages.length > 0 ? messages[messages.length - 1] : null;
  });

  const activeContact = computed<ApiContact | undefined>(() => {
    if (!activeConversation.value) return undefined;
    const currentContactId = route.params.contactId;
    return activeConversation.value.contacts.find(
      (contact) => contact.id === Number(currentContactId),
    );
  });

  const messengerOptions = computed<MessengerOption[]>(() => {
    const options: MessengerOption[] = [];

    if (activeContact.value?.chaport_id) {
      options.push({
        value: 3,
        label: "Chaport",
        image: "/imgs/chaport.png",
      });
    }

    options.push({
      value: 1,
      label: "Telegram",
      description:
        !activeContact.value?.tg_name && !activeContact.value?.phone
          ? "Додайте номер телефону або нік Telegram"
          : undefined,
      image: "/imgs/telegram.png",
      disabled: !activeContact.value?.tg_name && !activeContact.value?.phone,
      title:
        !activeContact.value?.tg_name && !activeContact.value?.phone
          ? "Додайте номер телефону або нік Telegram"
          : undefined,
    });

    options.push({
      value: 2,
      label: "Viber",
      description: !activeContact.value?.phone
        ? "Додайте номер телефону"
        : undefined,
      image: "/imgs/viber.png",
      disabled: !activeContact.value?.phone,
      title: !activeContact.value?.phone ? "Додайте номер телефону" : undefined,
    });

    return options;
  });

  const currentMessenger = computed(() => {
    return messengerOptions.value.find(
      (option) => option.value === messengerId.value,
    );
  });

  const setMessengerId = () => {
    if (lastMessage.value?.chaport_message_id) {
      messengerId.value = 3;
      return;
    }
    if (lastMessage.value?.echat_messages?.dialog?.messenger_id) {
      messengerId.value = lastMessage.value.echat_messages.dialog.messenger_id;
      return;
    }

    if (messengerOptions.value.length > 0) {
      messengerId.value = messengerOptions.value[0].value;
    }
  };

  const isOneEnabledMessenger = (messengerLabel: string): boolean => {
    const enabledMessengers = messengerOptions.value.filter(
      (option) => !option.disabled,
    );
    return (
      enabledMessengers.length === 1 &&
      enabledMessengers[0].label === messengerLabel
    );
  };

  watch(
    lastMessage,
    () => {
      setMessengerId();
    },
    { immediate: true },
  );

  return {
    messengerId,
    messengerOptions,
    currentMessenger,
    lastMessage,
    activeConversation,
    activeContact,

    setMessengerId,
    isOneEnabledMessenger,
  };
}
