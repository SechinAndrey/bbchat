import Pusher from "pusher-js";

const pusherConfig = {
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  encrypted: true,
};

export const pusher = new Pusher(
  import.meta.env.VITE_PUSHER_APP_KEY,
  pusherConfig,
);

export const getPusherConnectionState = () => pusher.connection.state;
export const isPusherConnected = () => pusher.connection.state === "connected";
