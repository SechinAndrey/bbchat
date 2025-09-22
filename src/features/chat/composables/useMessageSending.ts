import { computed, inject, type Ref } from "vue";
import type { EntityType } from "@src/shared/types/common";
import conversationsService from "@src/features/conversations/conversations-service";
import useConversationsStore from "@src/features/conversations/conversations-store";

export function useMessageSending() {
  const entity = inject<Ref<EntityType>>("entity");
  const id = inject<Ref<number>>("id");
  const store = useConversationsStore();

  const contragentType = computed(() => {
    if (entity?.value === "leads") return "lead";
    if (entity?.value === "clients") return "client";
    if (entity?.value === "suppliers") return "supplier";
    return "lead";
  });

  const activeConversation = computed(() => {
    return store.activeConversation;
  });

  /**
   * Send text message
   * @example await sendMessage('Hello!', 1, 'https://file.url')
   */
  const sendMessage = async (
    message: string,
    messengerId: number,
    fileUrl = "",
  ): Promise<void> => {
    if (!message.trim() && !fileUrl) {
      return;
    }

    try {
      await conversationsService.sendMessage({
        phone: activeConversation.value?.phone || "",
        message,
        file_url: fileUrl,
        messenger_id: messengerId,
        contragent_type: contragentType.value,
        contragent_id: id?.value || 0,
      });

      // Reset unread count after sending
      if (entity?.value && id?.value) {
        store.resetUnreadCount(entity.value, id.value);
      }
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      throw error;
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
      throw error;
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
