import { computed, type ComputedRef } from "vue";
import type { ApiMessageItem, ApiReplyMessageItem } from "@src/api/types";
import {
  getFileName,
  isImage,
  truncateFileName,
} from "@src/shared/utils/media";

export interface ParsedEchatMessage {
  media?: string;
  file?: string;
  files?: string;
  message?: string;
  [key: string]: unknown;
}

export function parseEchatMessageJson(
  messageJson: string | Record<string, unknown> | undefined | null,
): ParsedEchatMessage {
  if (typeof messageJson === "string") {
    try {
      return JSON.parse(messageJson);
    } catch {
      return {};
    }
  }
  return (messageJson as ParsedEchatMessage) || {};
}

export function getMessageImageUrl(
  message: ApiMessageItem,
): string | undefined {
  if (message.echat_messages) {
    const echatMsg = parseEchatMessageJson(message.echat_messages.message_json);
    const media = echatMsg.media || echatMsg.file;
    if (media && isImage(media)) return media;
  }
  if (
    message.chaport_messages?.file &&
    isImage(message.chaport_messages.file)
  ) {
    return message.chaport_messages.file;
  }
  return undefined;
}

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
    return parseEchatMessageJson(echat.value?.message_json);
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
