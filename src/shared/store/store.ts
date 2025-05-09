import { defineStore } from "pinia";
import type { Ref } from "vue";
import { computed, ref } from "vue";

import defaults from "@src/shared/store/real-api-example";
import { chatApiService } from "@src/api/api-service";

import type {
  IConversation,
  IContactGroup,
  IUser,
  INotification,
  ICall,
  ISettings,
  IEmoji,
} from "@src/shared/types/types";

const useStore = defineStore("chat", () => {
  // local storage
  const storage = JSON.parse(localStorage.getItem("chat") || "{}");

  // app status refs
  const status = ref("idle");
  const loadingStates = ref({
    user: false,
    conversations: false,
    notifications: false,
    calls: false,
  });

  const setLoadingState = (
    resource: keyof typeof loadingStates.value,
    value: boolean,
  ) => {
    loadingStates.value[resource] = value;
  };

  const isAnyResourceLoading = computed(() => {
    return Object.values(loadingStates.value).some((state) => state === true);
  });

  // app data refs
  // data refs
  const user: Ref<IUser | undefined> = ref(undefined);
  const conversations: Ref<IConversation[]> = ref([]);
  const notifications: Ref<INotification[]> = ref(defaults.notifications || []);
  const archivedConversations: Ref<IConversation[]> = ref(
    defaults.archive || [],
  );
  const calls: Ref<ICall[]> = ref(defaults.calls || []);
  const settings: Ref<ISettings> = ref(
    storage.settings || defaults.defaultSettings,
  );
  const activeCall: Ref<ICall | undefined> = ref(defaults.activeCall);
  const recentEmoji: Ref<IEmoji[]> = ref(storage.recentEmoji || []);
  const emojiSkinTone: Ref<string> = ref(storage.emojiSkinTone || "neutral");

  // ui refs
  const activeSidebarComponent: Ref<string> = ref(
    storage.activeSidebarComponent || "messages",
  );
  const delayLoading = ref(true);
  const conversationOpen: Ref<string | undefined> = ref(
    storage.conversationOpen,
  );
  const callMinimized = ref(false);
  const openVoiceCall = ref(false);

  const initializeData = async () => {
    try {
      status.value = "loading";

      Object.keys(loadingStates.value).forEach((key) => {
        setLoadingState(key as keyof typeof loadingStates.value, true);
      });

      // fake delay for loading
      setTimeout(() => {
        delayLoading.value = false;
      }, 500);

      const data = await chatApiService.getAllData();

      setLoadingState("user", false);
      user.value = data.user;

      setLoadingState("conversations", false);
      conversations.value = data.conversations;

      setLoadingState("notifications", false);
      notifications.value = data.notifications;

      setLoadingState("calls", false);
      calls.value = data.calls;
      activeCall.value = data.activeCall;

      status.value = "success";
      return true;
    } catch (error) {
      console.error("Something went wrong while loading data:", error);
      status.value = "error";

      Object.keys(loadingStates.value).forEach((key) => {
        setLoadingState(key as keyof typeof loadingStates.value, false);
      });

      return false;
    }
  };

  // contacts grouped alphabetically.
  const contactGroups: Ref<IContactGroup[] | undefined> = computed(() => {
    if (user.value) {
      const sortedContacts = [...user.value.contacts];

      sortedContacts.sort((a, b) => a.firstName.localeCompare(b.firstName));

      const groups: IContactGroup[] = [];
      let currentLetter: string = "";
      const groupNames: string[] = [];

      // create an array of letter for every different sort level.
      for (const contact of sortedContacts) {
        // if the first letter is different create a new group.
        if (contact.firstName[0].toUpperCase() !== currentLetter) {
          currentLetter = contact.firstName[0].toUpperCase();
          groupNames.push(currentLetter);
        }
      }

      // create an array that groups contact names based on the first letter;
      for (const groupName of groupNames) {
        const group: IContactGroup = { letter: groupName, contacts: [] };
        for (const contact of sortedContacts) {
          if (contact.firstName[0].toUpperCase() === groupName) {
            group.contacts.push(contact);
          }
        }
        groups.push(group);
      }

      return groups;
    }

    return undefined;
  });

  const getStatus = status;

  const sendMessage = async (
    roomId: number,
    content: string,
    files: File[] = [],
  ) => {
    try {
      status.value = "loading";

      const apiMessage = await chatApiService.sendMessage(
        roomId,
        content,
        files,
      );

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
    loadingStates,
    setLoadingState,
    isAnyResourceLoading,

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
    initializeData,
  };
});

export default useStore;
