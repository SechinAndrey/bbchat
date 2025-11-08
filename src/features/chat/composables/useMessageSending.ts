import { computed, inject, type Ref } from "vue";
import type { EntityType } from "@src/shared/types/common";
import { ENTITY_TO_CONTRAGENT_MAP } from "@src/shared/types/common";
import conversationsService from "@src/features/conversations/conversations-service";
import useConversationsStore, {
  type TempMessage,
} from "@src/features/conversations/conversations-store";
import { isApiSendMessageError, type ApiContact } from "@src/api/types";
import { useRoute } from "vue-router";
import { useToast } from "@src/shared/composables/useToast";

/**
 * Delay before sending message to API
 * Try to fix message order
 */
const MESSAGE_SEND_DELAY_MS = 100;

export function useMessageSending() {
  const entity = inject<Ref<EntityType>>("entity");
  const id = inject<Ref<number>>("id");
  const store = useConversationsStore();
  const route = useRoute();
  const { toastError } = useToast();

  const contragentType = computed(() => {
    if (!entity?.value) return "lead";
    return ENTITY_TO_CONTRAGENT_MAP[entity.value];
  });

  const activeConversation = computed(() => {
    return store.activeConversation;
  });

  /**
   * Send text message with optimistic updates
   * @example await sendMessage({ message: 'Hello!', messengerId: 1, fileUrl: 'https://file.url' })
   */
  const sendMessage = async (params: {
    message: string;
    messengerId: number;
    fileUrl?: string;
    replyMessageId?: number | null;
  }): Promise<void> => {
    const { message, messengerId, fileUrl = "", replyMessageId } = params;
    if (!message.trim() && !fileUrl) {
      console.warn("⚠️ Attempted to send empty message");
      return;
    }

    // Special handling for Chaport with both text and file
    // Chaport splits message+file into 2 separate messages on backend
    // So we send them as 2 separate requests with 2 temp messages
    if (messengerId === 3 && message.trim() && fileUrl) {
      await sendMessage({
        message: message.trim(),
        messengerId,
        replyMessageId,
      });

      await sendMessage({
        message: "",
        messengerId,
        fileUrl,
      });

      return;
    }

    const currentContactId = route.params.contactId;

    const currentContact: ApiContact | undefined =
      activeConversation.value?.contacts.find(
        (contact) => contact.id === Number(currentContactId),
      );

    const { phone, tg_name } = currentContact || {};
    let phoneOrTg = phone;
    if (messengerId === 1 && tg_name) {
      phoneOrTg = phone || tg_name;
    }

    if (!entity?.value || !id?.value || (!phoneOrTg && messengerId !== 3)) {
      console.error("❌ Missing required data for sending message");
      return;
    }

    const phoneValue = phoneOrTg || "";

    // 1. Create temporary message for optimistic update
    const clientMessageUid = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // get the full message for reply from the active chat
    const replyMessage = replyMessageId
      ? activeConversation.value?.messages.find(
          (msg) => msg.id === replyMessageId,
        ) || null
      : null;

    const tempMessage: TempMessage = {
      clientMessageUid,
      message,
      fileUrl,
      messengerId,
      status: "sending",
      timestamp: new Date(),
      contragentType: contragentType.value,
      contragentId: id.value,
      phone: phoneValue,
      contactId: Number(currentContactId),
      replyMessage,
    };

    // 2. Immediately add temporary message to chat
    store.addTempMessage(tempMessage);

    // 3. Play outgoing message sound
    store.playNotificationSound(true);

    // 4. Reset unread counter
    store.resetUnreadCount(entity.value, id.value, Number(currentContactId));

    // 5. Wait before sending to show temporary message first
    await new Promise((resolve) => setTimeout(resolve, MESSAGE_SEND_DELAY_MS));

    try {
      // 6. Send API request in background
      const response = await conversationsService.sendMessage({
        phone: phoneValue,
        message,
        file_url: fileUrl,
        messenger_id: messengerId,
        contragent_type: contragentType.value,
        contragent_id: id.value,
        contragent_contact_id: Number(currentContactId),
        client_message_uid: clientMessageUid,
        reply_message_id: replyMessageId,
      });

      if (isApiSendMessageError(response)) {
        console.log("❌ Error detected:", response.description);
        toastError("Щось пішло не так. Зверніться до технічного відділу.");
        store.updateTempMessageStatus(
          clientMessageUid,
          "error",
          response.description,
        );
        return;
      }

      // 7. Update status to "sent"
      store.updateTempMessageStatus(clientMessageUid, "sent");

      console.log(
        "✅ Message sent successfully, waiting for Pusher confirmation",
      );
    } catch (error) {
      // 8. Update status to error in case of failure
      const errorMessage =
        error instanceof Error ? error.message : "Message sending error";
      store.updateTempMessageStatus(clientMessageUid, "error", errorMessage);

      console.error("❌ Failed to send message:", error);
    }
  };

  /**
   * Send message with file attachment
   * @example await sendMessageWithFile(file, 'Caption', 1)
   */
  const sendMessageWithFile = async (
    file: any,
    caption: string,
    messengerId: number,
  ): Promise<void> => {
    try {
      const fileUrl = await conversationsService.uploadFile(file);
      await sendMessage({ message: caption, messengerId, fileUrl });
    } catch (error) {
      console.error("❌ Failed to send message with file:", error);
    }
  };

  return {
    entity,
    id,
    contragentType,
    activeConversation,

    sendMessage,
    sendMessageWithFile,
  };
}
