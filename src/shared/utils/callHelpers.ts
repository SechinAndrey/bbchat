import type { ApiCommunicationCallInfo } from "@src/api/types";
import {
  PhoneIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  PhoneXMarkIcon,
} from "@heroicons/vue/24/solid";
import type { Component } from "vue";

/**
 * Disposition to human-readable text
 */
export function getCallStatusText(
  disposition: string | null | undefined,
): string {
  if (!disposition) return "Невідомо";
  const upperDisposition = disposition.toUpperCase();
  switch (upperDisposition) {
    case "ANSWERED":
    case "ANSWER":
      return "Відповів";
    case "CANCEL":
    case "CANCELLED":
      return "Скасовано";
    case "NO ANSWER":
    case "NOANSWER":
      return "Не відповів";
    case "BUSY":
      return "Зайнято";
    case "FAILED":
      return "Невдалий";
    default:
      return disposition;
  }
}

/**
 * Returns icon and color for call status based on disposition and call type
 */
export function getCallStatusIcon(
  call: ApiCommunicationCallInfo | null | undefined,
): {
  icon: Component;
  color: string;
} {
  if (!call) return { icon: PhoneIcon, color: "text-app-text-secondary" };

  const disposition = call.disposition;
  const isIncoming = call.call_type === 0;
  const baseIcon = isIncoming ? PhoneArrowDownLeftIcon : PhoneArrowUpRightIcon;

  if (!disposition) return { icon: baseIcon, color: "text-app-text-secondary" };

  const upperDisposition = disposition.toUpperCase();
  switch (upperDisposition) {
    case "ANSWERED":
    case "ANSWER":
      return {
        icon: baseIcon,
        color: isIncoming ? "text-info" : "text-success",
      };
    case "CANCEL":
    case "CANCELLED":
      return { icon: PhoneXMarkIcon, color: "text-danger" };
    case "NO ANSWER":
    case "NOANSWER":
      return { icon: baseIcon, color: "text-warning" };
    case "BUSY":
      return { icon: baseIcon, color: "text-warning" };
    case "FAILED":
      return { icon: PhoneXMarkIcon, color: "text-danger" };
    default:
      return { icon: baseIcon, color: "text-app-text-secondary" };
  }
}

/**
 * Returns icon for call type (incoming/outgoing)
 */
export function getCallTypeIcon(
  call: ApiCommunicationCallInfo | null | undefined,
): Component {
  if (!call) return PhoneIcon;
  // call_type: 0 - incoming, 1 - outgoing
  return call.call_type === 0 ? PhoneArrowDownLeftIcon : PhoneArrowUpRightIcon;
}

/**
 * Formats call duration in seconds to human-readable format
 */
export function formatCallDuration(seconds: number): string {
  if (seconds === 0) return "0 сек";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes} хв ${remainingSeconds} сек`;
  }
  return `${remainingSeconds} сек`;
}
