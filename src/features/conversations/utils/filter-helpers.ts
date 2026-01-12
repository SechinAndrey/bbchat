import type { ConversationParams } from "../conversations-service";
import type { EntityType } from "@src/shared/types/common";

export interface User {
  id: number;
  roleId: number;
}

export function buildApiParams(
  filters: ConversationParams,
): ConversationParams {
  return {
    page: filters.page,
    search: filters.search || undefined,
    user_id: filters.user_id,
    communication_status_id: filters.communication_status_id,
    unread: filters.unread,
  };
}

export function shouldPlayNotificationSound(
  filters: ConversationParams,
  currentUser: User | null,
  messageUserId: number | string,
): boolean {
  if (!currentUser) return false;

  // Manager - only their own messages or "unassigned"
  if (currentUser.roleId !== 1) {
    return (
      messageUserId === currentUser.id || messageUserId === "user-not-selected"
    );
  }

  // Admin - depends on manager filter
  if (filters.user_id === undefined) {
    return true; // All messages
  }

  return (
    messageUserId === filters.user_id || messageUserId === "user-not-selected"
  );
}

/**
 * Checks if a new conversation should be added to the list when receiving a message
 */
export function shouldAddNewConversation(
  filters: ConversationParams,
  currentUser: User | null,
  currentEntity: EntityType | undefined,
  messageUserId: number | string,
  messageEntity: EntityType,
): boolean {
  // Wrong tab
  if (currentEntity !== messageEntity) {
    return false;
  }

  // Search is active - don't add (to avoid breaking search results)
  if (filters.search) {
    return false;
  }

  // Check manager filter (admin only)
  if (currentUser?.roleId === 1 && filters.user_id !== undefined) {
    if (messageUserId !== filters.user_id) {
      return false;
    }
  }

  return true;
}

/**
 * Determines if unread indicator should be shown on manager dropdown
 * Returns user_id if should show, null otherwise
 */
export function getManagerIndicatorToShow(
  filters: ConversationParams,
  currentUser: User | null,
  currentEntity: EntityType | undefined,
  messageUserId: number | string,
  messageEntity: EntityType,
): number | string | null {
  // Admin only
  if (!currentUser || currentUser.roleId !== 1) {
    return null;
  }

  // "All" filter + same tab - don't show indicator on manager
  if (filters.user_id === undefined && currentEntity === messageEntity) {
    return null;
  }

  // Manager filter active - show indicator for other managers
  if (filters.user_id !== undefined) {
    if (messageUserId !== filters.user_id) {
      return messageUserId;
    }
  }

  return null;
}

/**
 * Checks if conversation should be removed from list when manager changes
 */
export function shouldRemoveConversationOnUserChange(
  filters: ConversationParams,
  currentUser: User | null,
  newUserId: number,
): boolean {
  const isAdmin = currentUser?.roleId === 1;
  const currentUserId = currentUser?.id;

  if (isAdmin) {
    // Admin: remove only if filter is set and new manager doesn't match
    if (filters.user_id === undefined) {
      return false;
    }
    return newUserId !== filters.user_id;
  } else {
    // Manager: remove if conversation is no longer theirs
    return newUserId !== currentUserId;
  }
}
