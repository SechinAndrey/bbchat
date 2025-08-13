import { computed, type ComputedRef } from "vue";

interface UseUserAvatarReturn {
  avatarInitials: ComputedRef<string>;
  avatarColor: ComputedRef<string>;
}

export function useAvatarInitials(
  firstName: ComputedRef<string | null | undefined>,
  lastName: ComputedRef<string | null | undefined>,
  isActive?: ComputedRef<boolean>,
): UseUserAvatarReturn {
  const avatarInitials = computed(() => {
    if (!firstName.value && !lastName.value) {
      return "";
    }
    return (firstName.value?.[0] || "") + (lastName.value?.[0] || "");
  });

  const avatarColor = computed(() => {
    return isActive?.value ? "bg-app-bg-secondary" : "bg-app-bg";
  });

  return {
    avatarInitials,
    avatarColor,
  };
}
