import { ref } from "vue";
import { PushNotifications } from "@capacitor/push-notifications";
import type { Token, ActionPerformed } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";
import { App } from "@capacitor/app";
import { useAuthStore } from "@src/features/auth/store/auth-store";
import router from "@src/router";
import { CONTRAGENT_TO_ENTITY_MAP } from "@src/shared/types/common";
import type { ContragentType } from "@src/shared/types/common";

/**
 * Composable for working with Android push notifications via Firebase Cloud Messaging
 *
 * @returns Object with methods for working with push notifications
 */
export function useAndroidPush() {
  const authStore = useAuthStore();
  const token = ref<string | null>(null);

  /**
   * Send FCM token to backend
   */
  const sendTokenToBackend = async (fcmToken: string) => {
    try {
      authStore.fcmToken = fcmToken;
    } catch (error) {
      console.error("Failed to save Android FCM token:", error);
    }
  };

  /**
   * Register for push notifications
   */
  const registerPushNotifications = async () => {
    try {
      const permResult = await PushNotifications.requestPermissions();

      if (permResult.receive === "granted") {
        await LocalNotifications.requestPermissions();
        await PushNotifications.register();
      }
    } catch (error) {
      console.error(
        "❌ [FCM] Error registering for push notifications:",
        error,
      );
    }
  };

  /**
   * Handle successful FCM token registration
   */
  const handleRegistration = (tokenData: Token) => {
    token.value = tokenData.value;
    authStore.fcmToken = tokenData.value;
    sendTokenToBackend(tokenData.value);
  };

  /**
   * Handle FCM registration error
   */
  const handleRegistrationError = (error: any) => {
    console.error("❌ [FCM] Registration error:", error);
  };

  /**
   * Handle push notification received
   * Shows local notification only when app is in background
   */
  const handlePushReceived = async (notification: any) => {
    const appState = await App.getState();

    if (!appState.isActive && notification.title && notification.body) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Date.now(),
              title: notification.title,
              body: notification.body,
              extra: notification.data,
              smallIcon: "ic_stat_icon_config_sample",
              iconColor: "#488AFF",
            },
          ],
        });
      } catch (error) {
        console.error("❌ [FCM] Error showing local notification:", error);
      }
    }
  };

  /**
   * Extract navigation data from notification
   */
  const extractNavigationData = (data: any) => {
    const contragentType = data?.contragent_type as ContragentType;
    const entityType = contragentType
      ? CONTRAGENT_TO_ENTITY_MAP[contragentType]
      : null;
    const entityId = data?.contragent_id;
    const contactId = data?.contragent_contact_id;

    return { entityType, entityId, contactId };
  };

  /**
   * Navigate to chat
   */
  const navigateToChat = (
    entityType: string,
    entityId: string,
    contactId: string,
    source: "FCM" | "LOCAL" = "FCM",
  ) => {
    const route = `/chat/${entityType}/${entityId}/contact/${contactId}`;

    router
      .isReady()
      .then(() => {
        setTimeout(() => {
          router.push(route);
        }, 1000);
      })
      .catch((error) => {
        console.error(`❌ [${source}] Router not ready:`, error);
      });
  };

  /**
   * Handle FCM notification click
   */
  const handleNotificationAction = (action: ActionPerformed) => {
    const { entityType, entityId, contactId } = extractNavigationData(
      action.notification.data,
    );
    if (entityType && entityId && contactId) {
      navigateToChat(entityType, entityId, contactId, "FCM");
    }
  };

  /**
   * Initialize all push notification listeners
   */
  const initializeListeners = () => {
    PushNotifications.addListener("registration", handleRegistration);
    PushNotifications.addListener("registrationError", handleRegistrationError);
    PushNotifications.addListener(
      "pushNotificationReceived",
      handlePushReceived,
    );
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      handleNotificationAction,
    );

    LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (action) => {
        const { entityType, entityId, contactId } = extractNavigationData(
          action.notification.extra,
        );

        if (entityType && entityId && contactId) {
          navigateToChat(entityType, entityId, contactId, "LOCAL");
        }
      },
    );
  };

  /**
   * Clear FCM token on logout
   */
  const clearToken = async () => {
    token.value = null;
    authStore.fcmToken = "";
  };

  initializeListeners();
  registerPushNotifications();

  return {
    token,
    registerPushNotifications,
    clearToken,
  };
}
