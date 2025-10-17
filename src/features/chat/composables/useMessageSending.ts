import { computed, inject, type Ref } from "vue";
import type { EntityType } from "@src/shared/types/common";
import { ENTITY_TO_CONTRAGENT_MAP } from "@src/shared/types/common";
import conversationsService from "@src/features/conversations/conversations-service";
import useConversationsStore, {
  type TempMessage,
} from "@src/features/conversations/conversations-store";

export function useMessageSending() {
  const entity = inject<Ref<EntityType>>("entity");
  const id = inject<Ref<number>>("id");
  const store = useConversationsStore();

  const contragentType = computed(() => {
    if (!entity?.value) return "lead";
    return ENTITY_TO_CONTRAGENT_MAP[entity.value];
  });

  const activeConversation = computed(() => {
    return store.activeConversation;
  });

  /**
   * Send text message with optimistic updates
   * @example await sendMessage('Hello!', 1, 'https://file.url')
   */
  const sendMessage = async (
    message: string,
    messengerId: number,
    fileUrl = "",
  ): Promise<void> => {
    if (!message.trim() && !fileUrl) {
      console.warn("⚠️ Attempted to send empty message");
      return;
    }

    const phone = activeConversation.value?.phone || "";
    if (!entity?.value || !id?.value) {
      console.error("❌ Missing required data for sending message");
      return;
    }

    // 1. Create temporary message for optimistic update
    const clientMessageUid = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const tempMessage: TempMessage = {
      clientMessageUid,
      message,
      fileUrl,
      messengerId,
      status: "sending",
      timestamp: new Date(),
      contragentType: contragentType.value,
      contragentId: id.value,
      phone,
    };
    // 2. Immediately add temporary message to chat
    store.addTempMessage(tempMessage);

    // 3. Play outgoing message sound
    store.playNotificationSound(true);

    // 4. Reset unread counter
    store.resetUnreadCount(entity.value, id.value);

    try {
      // 5. Send API request in background
      await conversationsService.sendMessage({
        phone,
        message,
        file_url: fileUrl,
        messenger_id: messengerId,
        contragent_type: contragentType.value,
        contragent_id: id.value,
        client_message_uid: clientMessageUid,
      });

      // 6. Update status to "sent"
      store.updateTempMessageStatus(tempMessage.clientMessageUid, "sent");

      console.log(
        "✅ Message sent successfully, waiting for Pusher confirmation",
      );
    } catch (error) {
      // 7. Update status to error in case of failure
      const errorMessage =
        error instanceof Error ? error.message : "Message sending error";
      store.updateTempMessageStatus(
        tempMessage.clientMessageUid,
        "error",
        errorMessage,
      );

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
      await sendMessage(caption, messengerId, fileUrl);
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
