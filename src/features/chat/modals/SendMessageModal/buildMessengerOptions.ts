import type { ApiContact } from "@src/api/types";

export interface MessengerOption {
  value: number;
  label: string;
  image: string;
  disabled?: boolean;
  title?: string;
}

export function buildMessengerOptions(
  contact: ApiContact | null,
): MessengerOption[] {
  if (!contact) return [];
  const options: MessengerOption[] = [];

  if (contact.chaport_id) {
    options.push({ value: 3, label: "Chaport", image: "/imgs/chaport.png" });
  }
  options.push({
    value: 1,
    label: "Telegram",
    image: "/imgs/telegram.png",
    disabled: !contact.tg_name && !contact.phone,
    title:
      !contact.tg_name && !contact.phone
        ? "Додайте номер телефону або нік Telegram"
        : undefined,
  });
  options.push({
    value: 2,
    label: "Viber",
    image: "/imgs/viber.png",
    disabled: !contact.phone,
    title: !contact.phone ? "Додайте номер телефону" : undefined,
  });
  return options;
}
