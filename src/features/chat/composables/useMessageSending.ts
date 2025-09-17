import { computed, inject, type Ref } from "vue";
import type { EntityType } from "@src/shared/types/common";
import conversationsService from "@src/features/conversations/conversations-service";
import useConversationsStore from "@src/features/conversations/conversations-store";

export function useMessageSending() {
  const entity = inject<Ref<EntityType>>("entity");
  const id = inject<Ref<number>>("id");
  const conversationsStore = useConversationsStore();

  const contragent_type = computed(() => {
    if (entity?.value === "leads") return "lead";
    if (entity?.value === "clients") return "client";
    if (entity?.value === "suppliers") return "supplier";
    return "lead";
  });

  const activeConversationInfo = computed(() => {
    return conversationsStore.activeConversationInfo;
  });

  const sendTextMessage = async (
    message: string,
    messengerId: number,
    fileUrl = "",
  ): Promise<void> => {
    if (!message.trim() && !fileUrl) {
      return;
    }

    try {
      await conversationsService.sendMessage({
        phone: activeConversationInfo.value?.phone || "",
        message,
        file_url: fileUrl,
        messenger_id: messengerId,
        contragent_type: contragent_type.value,
        contragent_id: id?.value || 0,
      });

      if (entity?.value && id?.value) {
        conversationsStore.resetUnreadCount(entity.value, id.value);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const sendMessageWithFile = async (
    file: any,
    caption: string,
    messengerId: number,
  ): Promise<void> => {
    try {
      const fileUrl = await conversationsService.uploadFile(file);
      await sendTextMessage(caption, messengerId, fileUrl);
    } catch (error) {
      console.error("Error sending message with attachment:", error);
      throw error;
    }
  };

  return {
    entity,
    id,
    contragent_type,
    activeConversationInfo,
    sendTextMessage,
    sendMessageWithFile,
  };
}
