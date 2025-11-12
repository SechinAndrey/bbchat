<script setup lang="ts">
import type { IConversation } from "@src/shared/types/types";
import type {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
} from "@src/api/types";
import { computed } from "vue";
import { getAvatar, getName } from "@src/shared/utils/utils";
import { useAvatarInitials } from "@src/shared/composables/useAvatarInitials";
import flemeIcon from "@src/ui/icons/flemeIcon.vue";

interface Props {
  conversation:
    | IConversation
    | ApiCommunicationLeadFull
    | ApiCommunicationClientFull;
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
  avatarUrl?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  avatarUrl: null,
});

const name = getName(props.conversation) || "";
const [firstName, lastName] = name.split(" ");
const { avatarInitials, avatarColor } = useAvatarInitials(
  computed(() => firstName || null),
  computed(() => lastName || null),
  computed(() => props.isActive),
);

const avatar = computed(() => {
  return props.avatarUrl || getAvatar(props.conversation);
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "min-w-5 min-h-5 max-w-5 max-h-5 text-xs";
    case "lg":
      return "min-w-10 min-h-10 max-w-10 max-h-10 text-lg";
    default:
      return "min-w-7 min-h-7 max-w-7 max-h-7 text-sm";
  }
});
</script>

<template>
  <div
    :style="{ backgroundImage: `url(${avatar})` }"
    class="rounded-full bg-cover bg-center flex items-center justify-center"
    :class="[avatarColor, sizeClasses]"
  >
    <flemeIcon
      v-if="!avatar && conversation.entity === 'leads'"
      class="text-secondary"
    />
    <span
      v-else-if="!avatar"
      class="flex items-center justify-center w-full h-full font-semibold text-primary rounded-full"
    >
      {{ avatarInitials }}
    </span>
  </div>
</template>
