/**
 * Adapters for converting API data to UI format
 */

import type { IUser } from "@src/shared/types/types";

import type { ApiUser } from "./types";

/**
 * Splits user's full name into firstName and lastName
 * @param fullName User's full name
 * @returns Object with firstName and lastName
 */
export function splitName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: "",
    };
  } else if (parts.length >= 2) {
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  }

  return {
    firstName: fullName,
    lastName: "",
  };
}

/**
 * Converts API user to UI format
 * @param apiUser User from API
 * @returns User in UI format
 */
export function adaptUser(apiUser: ApiUser): IUser {
  const { firstName, lastName } = splitName(apiUser.name);

  return {
    id: apiUser.id,
    roleId: apiUser.role_id,
    firstName,
    lastName,
    email: apiUser.email,
    avatar: apiUser.avatar,
    token: "token", // No token in API response, using placeholder
    lastSeen: new Date(), // No lastSeen in API response, using current date
    contacts: [], // Contacts need to be fetched separately
  };
}
