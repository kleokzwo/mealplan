// frontend/src/api/userApi.js
import { httpClient } from "./httpClient";

export async function getMe() {
  return httpClient.get("/users/me");
}

export async function updateNotificationPreference(notificationPreference) {
  return httpClient.patch("/users/me/settings", {
    notificationPreference,
  });
}

export async function saveOnboardingProfile({ householdType, childrenCount }) {
  return httpClient.patch("/users/me/onboarding", {
    householdType,
    childrenCount,
  });
}

export async function updateHouseholdProfile({ householdType, childrenCount }) {
  return httpClient.patch("/users/me/household", {
    householdType,
    childrenCount,
  });
}