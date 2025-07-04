import type {
  IConversation,
  IContact,
  IMessage,
  IRecording,
  IMessageContent,
} from "@src/shared/types";
import type {
  ApiMessageContent,
  ApiMessageContentBinotel,
  ApiCommunicationMessage,
  ApiContact,
  ApiCommunicationLead,
  ApiCommunicationClient,
} from "@src/api/types";

export function adaptApiContactToIContact(contact: ApiContact): IContact {
  return {
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    avatar: contact.avatar || "",
    email: contact.email || "",
    lastSeen: new Date(contact.lastSeen || Date.now()),
  };
}

export function adaptApiContactsToIContacts(
  contacts: ApiContact[],
): IContact[] {
  return contacts.map(adaptApiContactToIContact);
}

function processMessageContent(
  content: ApiMessageContent | ApiMessageContentBinotel,
): string | IRecording | IMessageContent {
  if (typeof content === "string") {
    return content;
  } else if ((content as ApiMessageContentBinotel).binotel_id) {
    const from =
      (content as ApiMessageContentBinotel).call_type === 0
        ? "Вхідний"
        : "Вихідний";
    const desposition = (content as ApiMessageContentBinotel).disposition || "";
    const duration = (content as ApiMessageContentBinotel).billsec || 0;
    return {
      text: `${from} дзвінок ${desposition} на ${duration} сек.`,
      binotelId: (content as ApiMessageContentBinotel).binotel_id,
      phone: (content as ApiMessageContentBinotel).phone || "",
    };
  } else if ("message" in (content as ApiMessageContent)) {
    return {
      text: (content as ApiMessageContent).message || "",
      name: (content as ApiMessageContent).name || "",
    };
  } else {
    return "Повідомлення не розпізнано";
  }
}

export function adaptApiCommunicationMessageToIMessage(
  message: ApiCommunicationMessage,
  sender: IContact,
): IMessage {
  const adaptedMessage: IMessage = {
    id: message.id,
    type: message.type.name || "text",
    content: processMessageContent(message.content),
    date: message.date,
    sender: sender,
    state: message.state || "sent",
  };

  // TODO: ADD when api data will be ready

  // replyTo: message.replyTo || null,
  // previewData: message.previewData || null,
  // attachments: message.attachments || [],

  return adaptedMessage;
}

// Generic function to adapt API communication entities to IConversation
function adaptApiCommunicationToIConversation(
  entity: ApiCommunicationLead | ApiCommunicationClient,
  entityType: "lead" | "client",
): IConversation {
  const lastMessage = entity.messages?.at(-1);
  const lastContact = entity.contacts?.at(-1);

  return {
    id: entity.id,
    type: entity.type || "couple",
    entityType,
    name: entity.name || `${entityType}${entity.id}`,
    avatar: entity.avatar || "",
    admins: [],
    contacts: adaptApiContactsToIContacts(entity.contacts || []),
    messages:
      lastMessage && lastContact
        ? [
            adaptApiCommunicationMessageToIMessage(
              lastMessage,
              adaptApiContactToIContact(lastContact),
            ),
          ]
        : [],
    pinnedMessageHidden: false,
    draftMessage: "",
    communicationStatusId: entity.communication_status_id || 0,
  };
}

export function adaptApiCommunicationLeadToIConversation(
  lead: ApiCommunicationLead,
): IConversation {
  return adaptApiCommunicationToIConversation(lead, "lead");
}

export function adaptApiCommunicationClientToIConversation(
  client: ApiCommunicationClient,
): IConversation {
  return adaptApiCommunicationToIConversation(client, "client");
}
