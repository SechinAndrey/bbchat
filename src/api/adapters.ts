/**
 * Adapters for converting API data to UI format
 */

import type {
  IUser,
  IContact,
  IMessage,
  IConversation,
  IAttachment,
  IRecording,
  INotification,
  ICall,
} from "@src/shared/types/types";

import type {
  ApiUser,
  ApiRoom,
  ApiMessage,
  ApiMessageFile,
  ApiRoomUser,
  ApiRecording,
  ApiNotification,
  ApiCall,
} from "./types";

/**
 * Splits user's full name into firstName and lastName
 * @param fullName User's full name
 * @returns Object with firstName and lastName
 */
export function splitName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: "",
    };
  } else if (parts.length >= 2) {
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  }

  return {
    firstName: fullName,
    lastName: "",
  };
}

/**
 * Converts API user to UI format
 * @param apiUser User from API
 * @returns User in UI format
 */
export function adaptUser(apiUser: ApiUser): IUser {
  const { firstName, lastName } = splitName(apiUser.name);

  return {
    id: apiUser.id,
    roleId: apiUser.role_id,
    firstName,
    lastName,
    email: apiUser.email,
    avatar: apiUser.avatar,
    token: "token", // No token in API response, using placeholder
    lastSeen: new Date(), // No lastSeen in API response, using current date
    contacts: [], // Contacts need to be fetched separately
  };
}

/**
 * Converts API contact to UI format
 * @param apiContact Contact from API
 * @returns Contact in UI format
 */
export function adaptContact(apiContact: ApiRoomUser): IContact {
  const { firstName, lastName } = splitName(apiContact.username);

  return {
    id:
      parseInt(apiContact._id.replace(/\D/g, "")) ||
      Math.floor(Math.random() * 1000), // Convert ID or generate random one
    firstName,
    lastName,
    email: `${apiContact._id}@example.com`, // No email in API response, generating one
    avatar: "https://66.media.tumblr.com/avatar_c6a8eae4303e_512.pnj", // Using placeholder as there's no avatar in API contact
    lastSeen: new Date(), // No lastSeen in API response, using current date
  };
}

/**
 * Converts API message file to UI attachment format
 * @param apiFile File from API
 * @param index File index for unique ID
 * @returns Attachment in UI format
 */
export function adaptAttachment(
  apiFile: ApiMessageFile,
  index: number,
): IAttachment {
  return {
    id: index + 1,
    type: apiFile.audio
      ? "audio"
      : apiFile.type.match(/mp4|avi|mov/i)
        ? "video"
        : "image",
    name: apiFile.name,
    size: apiFile.size || "0 MB", // If size is not specified, use placeholder
    url: apiFile.url,
    thumbnail: apiFile.thumbnail || apiFile.url, // If no preview, use URL of the file itself
  };
}

/**
 * Converts API recording to UI format
 * @param apiRecording Recording from API
 * @returns Recording in UI format
 */
export function adaptRecording(apiRecording: ApiRecording): IRecording {
  return {
    id: apiRecording.id,
    size: apiRecording.size,
    src: apiRecording.src,
    duration: apiRecording.duration,
  };
}

/**
 * Converts API message to UI format
 * @param apiMessage Message from API
 * @param contacts List of contacts to search for the sender
 * @returns Message in UI format
 */
export function adaptMessage(
  apiMessage: ApiMessage,
  contacts: IContact[] = [],
): IMessage {
  // Find the sender among contacts
  const sender =
    contacts.find((c) => c.id.toString() === apiMessage.senderId) ||
    adaptContact({ _id: apiMessage.senderId, username: apiMessage.username });

  // Convert attachments
  const attachments = apiMessage.files.map((file, index) =>
    adaptAttachment(file, apiMessage._id * 100 + index),
  );

  // Create UI message
  return {
    id: apiMessage._id,
    content: apiMessage.content,
    date: `${apiMessage.date} ${apiMessage.timestamp}`,
    sender,
    state: apiMessage.state || "read", // Use placeholder if status is not specified
    replyTo: apiMessage.replyTo,
    attachments: attachments.length > 0 ? attachments : undefined,
    previewData: apiMessage.previewData,
  };
}

/**
 * Converts API room to UI conversation format
 * @param apiRoom Room from API
 * @param messages Room messages
 * @param currentUserId Current user ID
 * @returns Conversation in UI format
 */
export function adaptRoom(
  apiRoom: ApiRoom,
  messages: ApiMessage[] = [],
  currentUserId: number | string,
): IConversation {
  // Convert room participants to contacts
  const contacts = apiRoom.users
    .filter((user) => user._id !== currentUserId.toString())
    .map((user) => adaptContact(user));

  // Add current user if they're in the room
  const currentUser = apiRoom.users.find(
    (user) => user._id === currentUserId.toString(),
  );
  if (currentUser) {
    contacts.push(adaptContact(currentUser));
  }

  // Filter messages for this room and convert them
  const roomMessages = messages
    .filter((msg) => msg.roomId === apiRoom.roomId)
    .map((msg) => adaptMessage(msg, contacts));

  // Determine room type
  const roomType =
    apiRoom.type || (apiRoom.users.length <= 2 ? "couple" : "group");

  // By default, assign current user as admin in group and broadcast conversations
  // or use adminIds from API room if they exist
  let admins: number[] | undefined;
  if (roomType === "group" || roomType === "broadcast") {
    // Convert current user ID to number for use in admins
    const currentUserIdNum =
      typeof currentUserId === "string"
        ? parseInt(currentUserId.replace(/\D/g, "")) || 1
        : currentUserId;

    // Use adminIds from the room if they exist, otherwise add current user
    admins = apiRoom.adminIds || [currentUserIdNum];
  }

  return {
    id: apiRoom.roomId,
    type: roomType,
    name: apiRoom.roomName || "",
    avatar: apiRoom.avatar,
    contacts,
    messages: roomMessages,
    unread: apiRoom.unread || 0,
    draftMessage: "",
    entityType: "conversation",
    communicationStatusId: 1,
    // Add admins for group conversations and broadcasts
    admins: admins,
    // If there's a pinned message, convert it
    pinnedMessage: apiRoom.pinnedMessage
      ? adaptMessage(apiRoom.pinnedMessage, contacts)
      : undefined,
  };
}

/**
 * Converts API notification to UI format
 * @param apiNotification Notification from API
 * @returns Notification in UI format
 */
export function adaptNotification(
  apiNotification: ApiNotification,
): INotification {
  return {
    flag: apiNotification.flag,
    title: apiNotification.title,
    message: apiNotification.message,
  };
}

/**
 * Converts API call to UI format
 * @param apiCall Call from API
 * @returns Call in UI format
 */
export function adaptCall(apiCall: ApiCall): ICall {
  return {
    type: apiCall.type,
    direction: apiCall.direction,
    status: apiCall.status,
    date: apiCall.date,
    length: apiCall.length,
    members: apiCall.members,
    adminIds: apiCall.adminIds,
  };
}

/**
 * Converts API data to UI format
 * @param apiData API data
 * @param currentUserId Current user ID
 * @returns Data in UI format
 */
export function adaptApiDataToUI(
  apiData: {
    user?: ApiUser;
    rooms?: ApiRoom[];
    messages?: ApiMessage[];
    notifications?: ApiNotification[];
    calls?: ApiCall[];
    activeCall?: ApiCall;
  },
  currentUserId: number | string,
) {
  let user: IUser | undefined;
  let conversations: IConversation[] = [];
  let notifications: INotification[] = [];
  let calls: ICall[] = [];
  let activeCall: ICall | undefined;

  // Convert user
  if (apiData.user) {
    user = adaptUser(apiData.user);
  }

  // Convert rooms
  if (apiData.rooms && apiData.messages) {
    conversations = apiData.rooms.map((room) =>
      adaptRoom(room, apiData.messages, currentUserId),
    );
  }

  // Convert notifications
  if (apiData.notifications) {
    notifications = apiData.notifications.map((notification) =>
      adaptNotification(notification),
    );
  }

  // Convert calls
  if (apiData.calls) {
    calls = apiData.calls.map((call) => adaptCall(call));
  }

  // Convert active call
  if (apiData.activeCall) {
    activeCall = adaptCall(apiData.activeCall);
  }

  // Collect all unique contacts from all rooms (except current user)
  if (user && apiData.rooms) {
    const contactsMap = new Map<number, IContact>();
    apiData.rooms.forEach((room) => {
      room.users.forEach((u) => {
        // Skip the user themselves
        if (u._id === currentUserId.toString()) return;
        const contact = adaptContact(u);
        if (!contactsMap.has(contact.id)) {
          contactsMap.set(contact.id, contact);
        }
      });
    });
    user.contacts = Array.from(contactsMap.values());
  }

  return {
    user,
    conversations,
    notifications,
    calls,
    activeCall,
  };
}
