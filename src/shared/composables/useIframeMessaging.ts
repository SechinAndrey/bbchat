import { onMounted, onUnmounted } from "vue";

export interface IframeMessageTypes {
  "bb-widget:auth-by-token": { token: string; clientId: string };
  "bb-widget:ping": undefined;
  "bb-widget:pong": undefined;
  "bb-widget:loaded": undefined;
}

interface IframeMessage<
  T extends keyof IframeMessageTypes = keyof IframeMessageTypes,
> {
  type: T;
  payload?: IframeMessageTypes[T];
}

type MessageCallback<
  T extends keyof IframeMessageTypes = keyof IframeMessageTypes,
> = (payload: IframeMessageTypes[T]) => void;

let attached = false;
let listeners: Record<string, Set<MessageCallback<any>>> = {};

export function useIframeMessaging(options: { allowedOrigin: string }) {
  function on<T extends keyof IframeMessageTypes>(
    type: T,
    callback: MessageCallback<T>,
  ): () => void {
    if (!listeners[type]) {
      listeners[type] = new Set();
    }
    listeners[type].add(callback as MessageCallback<any>);

    return () => off(type, callback as MessageCallback<any>);
  }

  function off<T extends keyof IframeMessageTypes>(
    type: T,
    callback: MessageCallback<T>,
  ) {
    if (listeners[type]) {
      listeners[type].delete(callback as MessageCallback<any>);
      if (listeners[type].size === 0) {
        delete listeners[type];
      }
    }
  }

  function send<T extends keyof IframeMessageTypes>(
    message: IframeMessage<T>,
    targetOrigin: string,
  ) {
    if (targetOrigin !== options?.allowedOrigin) {
      console.warn(`Target origin ${targetOrigin} is not allowed`);
      return;
    }
    window.parent.postMessage(message, targetOrigin);
  }

  function handleMessage(event: MessageEvent) {
    if (event.origin !== options.allowedOrigin) {
      console.warn(`Origin ${event.origin} is not allowed`);
      return;
    }

    const message: IframeMessage = event.data;
    if (message && message.type && listeners[message.type]) {
      listeners[message.type].forEach((callback) => {
        callback(message.payload);
      });
    }
  }

  function startListening() {
    if (attached) return;
    window.addEventListener("message", handleMessage);
    attached = true;

    on("bb-widget:ping", () => {
      send({ type: "bb-widget:pong" }, options.allowedOrigin);
    });
  }

  function stopListening() {
    if (!attached) return;
    window.removeEventListener("message", handleMessage);
    attached = false;
  }

  onMounted(() => {
    startListening();
  });

  onUnmounted(() => {
    stopListening();
  });

  return { on, send };
}
