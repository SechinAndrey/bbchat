export interface ReplyQuoteContent {
  originalMessageText: string;
  replyMessageText: string;
}

const REPLY_MARKER_REGEX =
  /^\s*Reply\s+to\s*=>\s*([\s\S]*?)\s*;\s*Quote\s*:\s*([\s\S]+)\s*$/i;

export const parseReplyQuoteText = (
  text?: string | null,
): ReplyQuoteContent | null => {
  if (!text) {
    return null;
  }

  const normalizedText = text
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\"); // backslashes (must be last)

  const match = normalizedText.match(REPLY_MARKER_REGEX);
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
