import { computed, ref, watch, type Ref } from "vue";
import useConversationsStore from "@src/features/conversations/conversations-store";
import type {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
  ApiCommunicationSupplierFull,
  ApiMessageItem,
} from "@src/api/types";

export type MessengerOption = {
  value: number;
  label: string;
  image: string;
};

export function useMessenger() {
  const conversationsStore = useConversationsStore();

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

  const messengerOptions = computed<MessengerOption[]>(() => {
    const options: MessengerOption[] = [];

    if (activeConversation.value?.chaport_id) {
      options.push({
        value: 3,
        label: "Chaport",
        image: "/imgs/chaport.png",
      });
    }

    if (activeConversation.value?.tg_name) {
      options.push({
        value: 1,
        label: "Telegram",
        image: "/imgs/telegram.png",
      });
    }

    if (activeConversation.value?.phone) {
      options.push(
        {
          value: 2,
          label: "Viber",
          image: "/imgs/viber.png",
        },
        { value: 1, label: "Telegram", image: "/imgs/telegram.png" },
      );
    }

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
    // same as activeConversation in conversationsStore
    activeConversation,
    setMessengerId,
  };
}
