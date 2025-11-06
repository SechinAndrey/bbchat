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
    console.log(
      "📩 [FCM] Push received data:",
      JSON.stringify(notification.data, null, 2),
    );

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

    console.log(`🔔 [${source}] Will navigate to:`, route);
    console.log(
      `🔔 [${source}] Current route:`,
      router.currentRoute.value.fullPath,
    );

    router
      .isReady()
      .then(() => {
        console.log(`🔔 [${source}] Router is ready, navigating...`);

        setTimeout(() => {
          router
            .push(route)
            .then(() => {
              console.log(`✅ [${source}] Navigation successful to:`, route);
            })
            .catch((error) => {
              console.error(`❌ [${source}] Navigation error:`, error);
            });
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
    console.log(
      "🔔 [FCM] Push clicked data:",
      JSON.stringify(action.notification.data, null, 2),
    );

    const { entityType, entityId, contactId } = extractNavigationData(
      action.notification.data,
    );

    console.log("🔔 [FCM] Parsed navigation data:", {
      entityType,
      entityId,
      contactId,
    });

    if (entityType && entityId && contactId) {
      navigateToChat(entityType, entityId, contactId, "FCM");
    } else {
      console.warn("⚠️ [FCM] Missing required navigation data:", {
        entityType,
        entityId,
        contactId,
      });
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
        console.log(
          "🔔 [LOCAL] Clicked data:",
          JSON.stringify(action.notification.extra, null, 2),
        );

        const { entityType, entityId, contactId } = extractNavigationData(
          action.notification.extra,
        );

        console.log("🔔 [LOCAL] Parsed navigation data:", {
          entityType,
          entityId,
          contactId,
        });

        if (entityType && entityId && contactId) {
          navigateToChat(entityType, entityId, contactId, "LOCAL");
        } else {
          console.warn("⚠️ [LOCAL] Missing required navigation data:", {
            entityType,
            entityId,
            contactId,
          });
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
