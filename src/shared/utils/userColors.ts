/**
 * Utility for generating consistent user name colors based on user ID
 */

const COLORS_LIGHT = [
  "text-blue-600",
  "text-green-600",
  "text-purple-600",
  "text-pink-600",
  "text-indigo-600",
  "text-teal-600",
  "text-orange-600",
  "text-cyan-600",
  "text-red-600",
  "text-amber-600",
  "text-lime-600",
  "text-emerald-600",
  "text-sky-600",
  "text-violet-600",
  "text-fuchsia-600",
  "text-rose-600",
];

const COLORS_DARK = [
  "text-blue-400",
  "text-green-400",
  "text-purple-400",
  "text-pink-400",
  "text-indigo-400",
  "text-teal-400",
  "text-orange-400",
  "text-cyan-400",
  "text-red-400",
  "text-amber-400",
  "text-lime-400",
  "text-emerald-400",
  "text-sky-400",
  "text-violet-400",
  "text-fuchsia-400",
  "text-rose-400",
];

/**
 * Get a consistent color class for a user based on their ID
 * @param userId - The user ID to generate color for
 * @param isDarkMode - Whether dark mode is active
 * @returns Tailwind color class string
 */
export function getUserColor(
  userId: string | number | null | undefined,
  isDarkMode: boolean,
): string {
  if (!userId) return "text-gray-400";

  const colors = isDarkMode ? COLORS_DARK : COLORS_LIGHT;
  const userIdNum = Number(userId);
  const colorIndex = Number.isNaN(userIdNum) ? 0 : userIdNum % colors.length;

  return colors[colorIndex];
}
