import { computed, type ComputedRef } from "vue";

interface UseUserAvatarReturn {
  avatarInitials: ComputedRef<string>;
  avatarColor: ComputedRef<string>;
}

export function useUserAvatar(
  firstName: ComputedRef<string | null | undefined>,
  lastName: ComputedRef<string | null | undefined>,
): UseUserAvatarReturn {
  const avatarInitials = computed(() => {
    if (!firstName.value && !lastName.value) {
      return "";
    }
    return (firstName.value?.[0] || "") + (lastName.value?.[0] || "");
  });

  const avatarColor = computed(() => {
    if (!firstName.value && !lastName.value) {
      return "bg-white";
    }
    // Generate a color based on the initials
    const initials = avatarInitials.value.toUpperCase();
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  });

  return {
    avatarInitials,
    avatarColor,
  };
}
