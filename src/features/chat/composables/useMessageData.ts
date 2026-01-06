import { computed, type ComputedRef } from "vue";
import type { ApiMessageItem, ApiReplyMessageItem } from "@src/api/types";
import { getFileName, truncateFileName } from "@src/shared/utils/media";

export function useMessageData(
  message:
    | ComputedRef<ApiMessageItem | ApiReplyMessageItem>
    | ApiMessageItem
    | ApiReplyMessageItem,
) {
  const msg = computed(() => {
    return "value" in message ? message.value : message;
  });

  const echat = computed(() => {
    return msg.value.echat_messages;
  });

  const echatMessage = computed(() => {
    if (typeof echat.value?.message_json === "string") {
      return JSON.parse(echat.value.message_json);
    }
    return echat.value?.message_json || {};
  });

  const media = computed(() => {
    return echatMessage.value.media || echatMessage.value.files;
  });

  const contact = computed(() => {
    return (
      msg.value.lead_contact ||
      msg.value.client_contact ||
      msg.value.supplier_contact ||
      null
    );
  });

  const senderName = computed(() => {
    return contact.value?.fio || "Відправник";
  });

  const getMessageText = (maxLength: number) => {
    return computed(() => {
      let text = "";

      if (echat.value?.message) {
        text = echat.value.message;
      } else if (media.value) {
        text = truncateFileName(getFileName(media.value));
      } else {
        text = "Повідомлення";
      }
      if (maxLength && text.length > maxLength) {
        return text.slice(0, maxLength) + "...";
      }

      return text;
    });
  };

  return {
    echat,
    echatMessage,
    media,
    contact,
    senderName,
    getMessageText,
  };
}
