/// <reference types="@capacitor-community/safe-area" />
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ua.com.billboards.chat",
  appName: "Billboards Комунікації",
  webDir: "dist",
  plugins: {
    PushNotifications: {
      presentationOptions: [],
    },
    SafeArea: {},
  },
};

export default config;
