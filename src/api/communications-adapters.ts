import { ApiCommunicationsResponse, ApiLead, ApiClient } from "./types";
import { IConversation, IContact, IMessage } from "../shared/types/types";

// Helper function to parse HTML messages into IMessage array
const parseHtmlMessagesToMessages = (
  htmlMessages: string | null | undefined,
  leadContact: IContact,
): IMessage[] => {
  if (!htmlMessages || htmlMessages.trim() === "") {
    return [];
  }

  const messages: IMessage[] = [];
  let messageId = 1;

  // Split by <p> tags and filter empty strings
  const messageParts = htmlMessages
    .split(/<p[^>]*>/)
    .filter((part) => part.trim() !== "");

  for (const part of messageParts) {
    // Remove closing </p> tag and <br> tags
    let cleanPart = part.replace(/<\/p>/g, "").replace(/<br\s*\/?>/g, "\n");

    // Extract sender name from <strong> tags
    const strongMatch = cleanPart.match(/<strong[^>]*>(.*?)<\/strong>/);
    let senderName = "";
    let isFromLead = true;

    if (strongMatch) {
      senderName = strongMatch[1];
      cleanPart = cleanPart.replace(/<strong[^>]*>.*?<\/strong>/, "");
      // If sender name is not empty, it's from a manager/agent
      isFromLead = senderName === "";
    }

    // Extract date - look for date pattern after sender name
    const lines = cleanPart.split("\n").filter((line) => line.trim() !== "");
    if (lines.length < 2) continue;

    const dateStr = lines[0].trim();
    const messageContent = lines.slice(1).join(" ").trim();

    if (!messageContent) continue;

    // Create message object
    const message: IMessage = {
      id: messageId++,
      content: messageContent,
      date: dateStr,
      sender: isFromLead
        ? leadContact
        : {
            id: 999999, // Temporary ID for manager
            firstName: senderName || "Manager",
            lastName: "",
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              senderName || "M",
            )}&background=random&length=1`,
            email: "",
            lastSeen: new Date(),
          },
      state: "read",
    };

    messages.push(message);
  }

  return messages;
};

// Helper function to parse name into firstName and lastName
const parseFullName = (
  fullName: string | null | undefined,
): { firstName: string; lastName: string } => {
  if (!fullName || fullName.trim() === "") {
    return { firstName: "Unknown", lastName: "User" };
  }
  const parts = fullName.split(" ").filter((part) => part.length > 0);
  let firstName = parts[0] || "Unknown";
  let lastName = parts.slice(1).join(" ");

  if (parts.length === 1 && parts[0]) {
    firstName = parts[0];
    lastName = "";
  } else if (parts.length > 1) {
    lastName = parts.slice(1).join(" ");
  } else {
    // Default if parts is empty after filter, though previous check should catch it
    lastName = "User";
  }

  return { firstName, lastName };
};

const adaptApiLeadToContact = (apiLead: ApiLead): IContact => {
  const { firstName, lastName } = parseFullName(apiLead.fio || apiLead.name);
  const contactNameForAvatar = apiLead.name || firstName || "L";
  return {
    id: apiLead.id,
    firstName,
    lastName,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      contactNameForAvatar,
    )}&background=random&length=1`,
    email: apiLead.email || "",
    lastSeen: apiLead.updated_at ? new Date(apiLead.updated_at) : new Date(0), // Use epoch if no date
  };
};

const adaptApiClientToContact = (apiClient: ApiClient): IContact => {
  const { firstName, lastName } = parseFullName(
    apiClient.fio || apiClient.name,
  );
  const contactNameForAvatar = apiClient.name || firstName || "C";
  return {
    id: apiClient.id,
    firstName,
    lastName,
    avatar:
      apiClient.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        contactNameForAvatar,
      )}&background=random&length=1`,
    email: apiClient.email || "",
    lastSeen: apiClient.updated_at
      ? new Date(apiClient.updated_at)
      : new Date(0), // Use epoch if no date
  };
};

export const adaptApiLeadToConversation = (apiLead: ApiLead): IConversation => {
  const contact = adaptApiLeadToContact(apiLead);
  const messages = parseHtmlMessagesToMessages(apiLead.messages, contact);

  return {
    id: apiLead.id,
    type: "lead",
    name: apiLead.name, // Use the direct name from API for conversation title
    avatar: contact.avatar,
    admins: [], // Placeholder, ApiLead doesn't have adminIds directly in list view
    contacts: [contact],
    messages, // Parse HTML messages into IMessage array
    pinnedMessage: undefined, // Placeholder
    pinnedMessageHidden: false,
    replyMessage: undefined, // Placeholder
    // unread: apiLead.unread_count || 0, // Example if API provided unread count
    unread: 0, // Placeholder, as ApiLead doesn't have unread count in list
    draftMessage: "",
  };
};

export const adaptApiClientToConversation = (
  apiClient: ApiClient,
): IConversation => {
  const contact = adaptApiClientToContact(apiClient);
  const messages = parseHtmlMessagesToMessages(apiClient.messages, contact);

  return {
    id: apiClient.id,
    type: "client",
    name: apiClient.name, // Use the direct name from API for conversation title
    avatar: contact.avatar,
    admins: [], // Placeholder, ApiClient doesn't have adminIds directly in list view
    contacts: [contact],
    messages, // Parse HTML messages into IMessage array
    pinnedMessage: undefined, // Placeholder
    pinnedMessageHidden: false,
    replyMessage: undefined, // Placeholder
    // unread: apiClient.unread_count || 0, // Example if API provided unread count
    unread: 0, // Placeholder
    draftMessage: "",
  };
};

export const adaptApiCommunicationsResponseToConversations = (
  response: ApiCommunicationsResponse,
): IConversation[] => {
  const leadConversations: IConversation[] =
    response?.leads?.data?.map(adaptApiLeadToConversation) || [];

  const clientConversations: IConversation[] =
    response?.clients?.data?.map(adaptApiClientToConversation) || [];

  const allConversations = [...leadConversations, ...clientConversations];

  allConversations.sort((a, b) => {
    const lastSeenA = a.contacts[0]?.lastSeen.getTime() || 0;
    const lastSeenB = b.contacts[0]?.lastSeen.getTime() || 0;
    return lastSeenB - lastSeenA;
  });

  return allConversations;
};
