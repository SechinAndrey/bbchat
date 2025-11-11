import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ua.com.billboards.chat",
  appName: "Billboards Комунікації",
  webDir: "dist",
  plugins: {
    PushNotifications: {
      presentationOptions: [],
    },
  },
};

export default config;
