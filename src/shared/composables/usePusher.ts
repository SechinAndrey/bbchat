import { onMounted, onUnmounted, ref } from "vue";
import type { Channel } from "pusher-js";
import { pusher, isPusherConnected } from "@src/shared/pusher";
import type { PusherEventMap } from "@src/shared/types/pusher-events";

type ChannelName = keyof PusherEventMap;
type EventName<C extends ChannelName> = keyof PusherEventMap[C];
type EventPayload<
  C extends ChannelName,
  E extends EventName<C>,
> = PusherEventMap[C][E];

type EventCallback<C extends ChannelName, E extends EventName<C>> = (
  payload: EventPayload<C, E>,
) => void;

export interface PusherEventHandler {
  channel: ChannelName;
  event: string;
  callback: (data: any) => void;
}

export function usePusher() {
  const isConnected = ref(false);
  const channels = ref<Record<string, Channel>>({});
  const subscriptions = ref<PusherEventHandler[]>([]);

  const updateConnectionStatus = () => {
    isConnected.value = isPusherConnected();
  };

  const subscribeToChannel = (channelName: string) => {
    if (!channels.value[channelName]) {
      channels.value[channelName] = pusher.subscribe(channelName);
    }
    return channels.value[channelName];
  };

  const unsubscribeFromChannel = (channelName: string) => {
    if (channels.value[channelName]) {
      pusher.unsubscribe(channelName);
      delete channels.value[channelName];
    }
  };

  const bindEvent = <C extends ChannelName, E extends EventName<C>>(
    channelName: C,
    eventName: E,
    callback: EventCallback<C, E>,
  ) => {
    const channel = subscribeToChannel(channelName);
    channel.bind(eventName as string, callback);

    subscriptions.value.push({
      channel: channelName,
      event: eventName as string,
      callback,
    });
  };

  const unbindEvent = <C extends ChannelName, E extends EventName<C>>(
    channelName: C,
    eventName: E,
    callback?: EventCallback<C, E>,
  ) => {
    const channel = channels.value[channelName];
    if (channel) {
      channel.unbind(eventName as string, callback);
    }

    subscriptions.value = subscriptions.value.filter(
      (sub) =>
        !(
          sub.channel === channelName &&
          sub.event === eventName &&
          sub.callback === callback
        ),
    );
  };

  const setupConnectionListeners = () => {
    pusher.connection.bind("connected", () => {
      console.log("✅ Pusher connected");
      updateConnectionStatus();
    });

    pusher.connection.bind("disconnected", () => {
      console.log("❌ Pusher disconnected");
      updateConnectionStatus();
    });

    pusher.connection.bind("error", (error: Error) => {
      console.error("🚨 Pusher connection error:", error);
    });
  };

  const cleanup = () => {
    subscriptions.value.forEach(({ channel, event, callback }) => {
      const channelInstance = channels.value[channel];
      if (channelInstance) {
        channelInstance.unbind(event, callback);
      }
    });

    Object.keys(channels.value).forEach((channelName) => {
      unsubscribeFromChannel(channelName);
    });

    subscriptions.value = [];
  };

  onMounted(() => {
    setupConnectionListeners();
    updateConnectionStatus();
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    isConnected,
    channels,
    subscribeToChannel,
    unsubscribeFromChannel,
    bindEvent,
    unbindEvent,
    cleanup,
  };
}
