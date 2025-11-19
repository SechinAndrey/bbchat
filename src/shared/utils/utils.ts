import useStore from "@src/shared/store/store";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import type {
  ICall,
  IContact,
  IConversation,
  IMessage,
  IMessageContent,
  IRecording,
} from "@src/shared/types/types";
import type {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
  ApiContact,
} from "@src/api/types";
import { useRoute } from "vue-router";

/**
 * combine first name and last name of a contact.
 * @param contact
 * @returns A string the combines the first and last names.
 */
export const getFullName = (
  contact: IContact | ApiContact,
  hyphen?: boolean,
) => {
  if (hyphen) {
    return contact.firstName + "-" + contact.lastName;
  } else {
    return contact.firstName + " " + contact.lastName;
  }
};

/**
 * get the other contact that is not the authenticated user.
 * @param conversation
 * @returns A contact object representing the other user in the conversation.
 */
export const getOddContact = (
  conversation:
    | IConversation
    | ApiCommunicationLeadFull
    | ApiCommunicationClientFull,
) => {
  const store = useStore();
  const authStore = useAuthStore();

  let oddContact;

  if (!conversation.contacts || conversation.contacts.length === 0) {
    return undefined;
  }

  for (const contact of conversation.contacts) {
    // Check against current user from auth store first, fallback to legacy store
    const currentUserId = authStore.currentUser?.id || store.user?.id;
    if (currentUserId && contact.id !== currentUserId) {
      oddContact = contact;
    }
  }

  return oddContact;
};

/**
 * get avatar based on conversation type.
 * @param conversation
 * @returns A string representing the url to the avatar image
 */
export const getAvatar = (
  conversation:
    | IConversation
    | ApiCommunicationLeadFull
    | ApiCommunicationClientFull,
) => {
  if (["group", "broadcast"].includes(conversation.type)) {
    return conversation?.avatar;
  } else {
    const oddContact = getOddContact(conversation);
    return oddContact?.avatar;
  }
};

/**
 * get name based on conversation type.
 * @param conversation
 * @returns String
 */
export const getName = (
  conversation:
    | IConversation
    | ApiCommunicationLeadFull
    | ApiCommunicationClientFull,
  hyphen?: boolean,
) => {
  if (conversation.type && ["group", "broadcast"].includes(conversation.type)) {
    if (hyphen) {
      return (conversation.name as string).split(" ").join("-");
    } else {
      return conversation.name;
    }
  } else {
    // For couple type (leads/clients), first try to use conversation.name
    if (conversation.name) {
      if (hyphen) {
        return conversation.name.split(" ").join("-");
      } else {
        return conversation.name;
      }
    }

    // Fallback to contact name if conversation.name is not available
    const oddContact = getOddContact(conversation);
    if (oddContact) {
      return getFullName(oddContact, hyphen);
    }

    // If no name found, return undefined
    return undefined;
  }
};

/**
 * trim a string when it reaches a certain length and adds three dots
 * at the end.
 * @param text
 * @param maxLength
 * @returns A string that is trimmed according the length provided
 */
export const shorten = (message: IMessage | string, maxLength: number = 23) => {
  let text: string | IRecording | IMessageContent | undefined;

  if (typeof message === "string") {
    text = message;
  } else {
    text = message.content;
  }

  // Handle different content types
  let textToProcess: string | undefined;

  if (typeof text === "string") {
    textToProcess = text;
  } else if (text && typeof text === "object" && "text" in text) {
    // Handle IMessageContent type
    textToProcess = text.text;
  } else {
    // Handle IRecording or other types - return a default message
    return "Recording";
  }

  if (textToProcess) {
    let graphemes: string[];

    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      // Modern browsers: use Intl.Segmenter for accurate grapheme segmentation
      const segmenter = new Intl.Segmenter("uk", { granularity: "grapheme" });
      graphemes = Array.from(
        segmenter.segment(textToProcess),
        (s) => s.segment,
      );
    } else {
      // Fallback: use regex to match grapheme clusters
      const graphemeRegex =
        /[\p{Emoji_Presentation}\p{Emoji}\uFE0F][\u{E0020}-\u{E007F}]*[\u{FE00}-\u{FE0F}]?(?:\u{200D}[\p{Emoji_Presentation}\p{Emoji}\uFE0F][\u{E0020}-\u{E007F}]*[\u{FE00}-\u{FE0F}]?)*/gu;
      const emojis = textToProcess.match(graphemeRegex) || [];
      const textWithoutEmojis = textToProcess.replace(graphemeRegex, "\x00");

      graphemes = [];
      let emojiIndex = 0;
      for (const char of textWithoutEmojis) {
        if (char === "\x00") {
          graphemes.push(emojis[emojiIndex++]);
        } else {
          graphemes.push(char);
        }
      }
    }

    if (graphemes.length > maxLength) {
      const trimmedString = graphemes.slice(0, maxLength).join("");

      return trimmedString + "...";
    }

    return textToProcess;
  }

  return "";
};

/**
 * test if the message contains attachments
 * @param message
 * @returns A boolean indicating whether the message has attachments
 */
export const hasAttachments = (message: IMessage) => {
  const attachments = message.attachments;
  return attachments && attachments.length > 0;
};

/**
 * extract the id of the active conversaiton from the url
 */
export const getActiveConversationId = () => {
  try {
    const route = useRoute();
    if (route && route.params && route.params.id) {
      return Number(route.params.id);
    }
    return undefined;
  } catch (error) {
    console.error("Error in getActiveConversationId:", error);
    return undefined;
  }
};

/**
 * get index of the conversation inside the conversations array
 * @param conversationId
 * @returns A number indicating the index of the conversation.
 */
export const getConversationIndex = (
  conversationId: number,
): number | undefined => {
  let conversationIndex;
  const store = useStore();

  store.conversations.forEach((conversation, index) => {
    if (conversation.id === conversationId) {
      conversationIndex = index;
    }
  });

  return conversationIndex;
};

/**
 * takes a call object and returns all the members
 * of the call except the authenticated user.
 * @param call
 * @returns An array containing the contacts participating in the call
 */
export const getOtherMembers = (call: ICall) => {
  const store = useStore();
  const authStore = useAuthStore();
  const members = [];

  if (call) {
    for (const member of call.members) {
      // Check against current user from auth store first, fallback to legacy store
      const currentUserId = authStore.currentUser?.id || store.user?.id;
      if (currentUserId && member.id !== currentUserId) {
        members.push(member);
      }
    }
  }

  return members;
};

/**
 * takes a call object and returns a name for the call
 * @param call
 * @param full
 * @param maxLength
 * @returns A string representing name of the call.
 */
export const getCallName = (
  call: ICall,
  full?: boolean,
  maxLength: number = 20,
) => {
  const members = getOtherMembers(call);
  let callName: string = "";

  for (const member of members) {
    callName += getFullName(member);

    if (members.length > 1) {
      callName += ", ";
    }
  }

  if (full) {
    return callName;
  } else {
    return shorten(callName, maxLength);
  }
};

export const getMessageById = (
  conversation: IConversation,
  messageId?: number,
) => {
  if (messageId) {
    return conversation.messages.find((message) => message.id === messageId);
  }
};

/**
 * Convert unicode to native emoji
 *
 * @param unicode - emoji unicode
 */
export const unicodeToEmoji = (unicode: string) => {
  return unicode
    .split("-")
    .map((hex) => parseInt(hex, 16))
    .map((hex) => String.fromCodePoint(hex))
    .join("");
};

/**
 * Universal date formatter with custom options
 * @param dateInput - The date to format
 * @param options - Custom Intl.DateTimeFormat options
 * @param locale - The locale to use
 * @returns Formatted date string
 */
export const formatDate = (
  dateInput: Date | string | number | undefined | null,
  options?: Intl.DateTimeFormatOptions,
  locale: string = "uk-UA",
): string => {
  if (!dateInput) {
    return "";
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
};

/**
 * Check if the date is today
 * @param date - Date to check
 * @returns Boolean indicating if the date is today
 */
export const isToday = (date: Date): boolean => {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

/**
 * Format date for conversation list - shows time for today, full date for other days
 * @param dateInput - The date to format
 * @param locale - The locale to use
 * @returns Formatted date string
 */
export const formatConversationDate = (
  dateInput: Date | string | number | undefined | null,
  locale: string = "uk-UA",
): string => {
  if (!dateInput) {
    return "";
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "";
  }

  if (isToday(date)) {
    return formatDate(
      dateInput,
      {
        hour: "numeric",
        minute: "numeric",
      },
      locale,
    );
  } else {
    return formatDate(
      dateInput,
      {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      },
      locale,
    );
  }
};

/**
 * Formats seconds into a string in the format "MM:SS".
 * @param seconds - The number of seconds to format.
 * @returns A string representing the formatted time.
 */
export const formatSeconds = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${paddedMinutes}:${paddedSeconds}`;
};

/**
 * Format message date for timeline dividers - shows "Сьогодні", "Вчора" or formatted date
 * @param dateInput - The date to format
 * @param locale - The locale to use
 * @returns Formatted date string for message timeline
 */
export const formatMessageDate = (
  dateInput: Date | string | number | undefined | null,
  locale: string = "uk-UA",
): string => {
  if (!dateInput) {
    return "";
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Сьогодні";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Вчора";
  } else {
    return formatDate(
      dateInput,
      {
        day: "numeric",
        month: "long",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      },
      locale,
    );
  }
};

/**
 * Extract validation errors from API error response
 * @param error - Axios error object
 * @returns A formatted string with all validation errors
 */
export const extractValidationErrors = (error: any): string => {
  if (!error?.response?.data?.errors) {
    return "Unknown error";
  }

  const errors = error.response.data.errors;

  if (typeof errors === "string") {
    return errors;
  }

  if (typeof errors === "object" && errors !== null) {
    const errorMessages: string[] = [];

    for (const [field, messages] of Object.entries(errors)) {
      if (Array.isArray(messages)) {
        errorMessages.push(`${field}: ${messages.join(", ")}`);
      } else if (typeof messages === "string") {
        errorMessages.push(`${field}: ${messages}`);
      }
    }

    return errorMessages.length > 0
      ? errorMessages.join("; ")
      : "Validation error";
  }

  return "Unknown error";
};
