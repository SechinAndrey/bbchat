export interface ReplyQuoteContent {
  originalMessageText: string; // Текст оригинального сообщения (на которое отвечают)
  replyMessageText: string; // Текст ответа (новое сообщение)
}

const REPLY_MARKER_REGEX =
  /^\s*Reply to\s*=>\s*([\s\S]*?)\s*;\s*Quote\s*:\s*([\s\S]+?)\s*$/i;

export const parseReplyQuoteText = (
  text?: string | null,
): ReplyQuoteContent | null => {
  if (!text) {
    return null;
  }

  const match = text.match(REPLY_MARKER_REGEX);
  if (!match) {
    return null;
  }

  const originalMessageText = match[1]?.trim();
  const replyMessageText = match[2]?.trim();

  if (!originalMessageText || !replyMessageText) {
    return null;
  }

  return {
    originalMessageText,
    replyMessageText,
  };
};
