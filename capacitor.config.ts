import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ua.com.billboards.chat",
  appName: "Billboards Комунікації",
  webDir: "dist",
  plugins: {
    PushNotifications: {
      presentationOptions: [],
    },
    StatusBar: {
      backgroundColor: "#3d445c",
      style: "DARK",
      overlaysWebView: false,
    },
  },
};

export default config;
