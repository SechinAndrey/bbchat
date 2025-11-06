import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ua.com.billboards.chat",
  appName: "BbChat",
  webDir: "dist",
  plugins: {
    PushNotifications: {
      presentationOptions: [],
    },
  },
};

export default config;
