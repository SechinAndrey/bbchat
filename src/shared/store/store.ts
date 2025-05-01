import { defineStore } from "pinia";
import type { Ref } from "vue";
import { computed, ref } from "vue";

import defaults from "@src/shared/store/real-api-example.ts";
import { chatApiService } from "@src/api/api-service.ts";

import type {
  IConversation,
  IContactGroup,
  IUser,
  INotification,
  ICall,
  ISettings,
  IEmoji,
} from "@src/shared/types/types.ts";

const useStore = defineStore("chat", () => {
  // local storage
  const storage = JSON.parse(localStorage.getItem("chat") || "{}");

  // app status refs
  const status = ref("idle");

  // app data refs
  // data refs
  const user: Ref<IUser | undefined> = ref(undefined);
  const conversations: Ref<IConversation[]> = ref([]);
  const notifications: Ref<INotification[]> = ref(defaults.notifications || []);
  const archivedConversations: Ref<IConversation[]> = ref(
    defaults.archive || []
  );
  const calls: Ref<ICall[]> = ref(defaults.calls || []);
  const settings: Ref<ISettings> = ref(storage.settings || defaults.defaultSettings);
  const activeCall: Ref<ICall | undefined> = ref(defaults.activeCall);
  const recentEmoji: Ref<IEmoji[]> = ref(storage.recentEmoji || []);
  const emojiSkinTone: Ref<string> = ref(storage.emojiSkinTone || "neutral");

  // ui refs
  const activeSidebarComponent: Ref<string> = ref(
    storage.activeSidebarComponent || "messages"
  );
  const delayLoading = ref(true);
  const conversationOpen: Ref<string | undefined> = ref(
    storage.conversationOpen
  );
  const callMinimized = ref(false);
  const openVoiceCall = ref(false);

  const initializeData = async () => {
    try {
      status.value = "loading";

      // fake delay for loading
      setTimeout(() => {
        delayLoading.value = false;
      }, 500);


      const data = await chatApiService.getAllData();

      user.value = data.user;
      conversations.value = data.conversations;
      notifications.value = data.notifications;
      calls.value = data.calls;
      activeCall.value = data.activeCall;

      status.value = "success";
      return true;
    } catch (error) {
      console.error("Something went wrong while loading data:", error);
      status.value = "error";
      return false;
    }
  };

  // contacts grouped alphabetically.
  const contactGroups: Ref<IContactGroup[] | undefined> = computed(() => {
    if (user.value) {
      let sortedContacts = [...user.value.contacts];

      sortedContacts.sort((a, b) => a.firstName.localeCompare(b.firstName));

      let groups: IContactGroup[] = [];
      let currentLetter: string = "";
      let groupNames: string[] = [];

      // create an array of letter for every different sort level.
      for (let contact of sortedContacts) {
        // if the first letter is different create a new group.
        if (contact.firstName[0].toUpperCase() !== currentLetter) {
          currentLetter = contact.firstName[0].toUpperCase();
          groupNames.push(currentLetter);
        }
      }

      // create an array that groups contact names based on the first letter;
      for (let groupName of groupNames) {
        let group: IContactGroup = { letter: groupName, contacts: [] };
        for (let contact of sortedContacts) {
          if (contact.firstName[0].toUpperCase() === groupName) {
            group.contacts.push(contact);
          }
        }
        groups.push(group);
      }

      return groups;
    }
  });

  const getStatus = status;

  const sendMessage = async (roomId: number, content: string, files: File[] = []) => {
    try {
      status.value = "loading";

      const apiMessage = await chatApiService.sendMessage(roomId, content, files);

      // update all for now, improve with real api later
      await initializeData();

      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      status.value = "error";
      return false;
    }
  };

  return {
    // status refs
    status,
    getStatus,

    // data refs
    user,
    conversations,
    contactGroups,
    notifications,
    archivedConversations,
    calls,
    settings,
    activeCall,
    recentEmoji,
    emojiSkinTone,

    // ui refs
    activeSidebarComponent,
    delayLoading,
    conversationOpen,
    callMinimized,
    openVoiceCall,

    // actions
    sendMessage,
    initializeData
  };
});

export default useStore;
