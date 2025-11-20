"use server";

import { getCurrentUser } from "./user-action";
import { prisma } from "@/lib/prisma";

export interface UserSettings {
  autoLogout: {
    enabled: boolean;
    timeout: number;
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  autoLogout: {
    enabled: true,
    timeout: 15 * 60 * 1000, // 15 minutes
  },
};

export async function getUserSettings(): Promise<UserSettings> {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return DEFAULT_SETTINGS;
  }

  try {
    let settings = await prisma.userSettings.findUnique({
      where: { userId: currentUser.id },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: currentUser.id,
          autoLogoutEnabled: DEFAULT_SETTINGS.autoLogout.enabled,
          autoLogoutTimeout: DEFAULT_SETTINGS.autoLogout.timeout,
        },
      });
    }

    return {
      autoLogout: {
        enabled: settings.autoLogoutEnabled,
        timeout: settings.autoLogoutTimeout,
      },
    };
  } catch (error) {
    console.error("Failed to get user settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateUserSettings(newSettings: Partial<UserSettings>) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  try {
    const updateData: any = {};

    if (newSettings.autoLogout) {
      if (newSettings.autoLogout.enabled !== undefined) {
        updateData.autoLogoutEnabled = newSettings.autoLogout.enabled;
      }
      if (newSettings.autoLogout.timeout !== undefined) {
        updateData.autoLogoutTimeout = newSettings.autoLogout.timeout;
      }
    }

    await prisma.userSettings.upsert({
      where: { userId: currentUser.id },
      update: updateData,
      create: {
        userId: currentUser.id,
        autoLogoutEnabled: newSettings.autoLogout?.enabled ?? true,
        autoLogoutTimeout: newSettings.autoLogout?.timeout ?? 15 * 60 * 1000,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update user settings:", error);
    throw new Error("Failed to update settings");
  }
}

export async function resetUserSettings() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  try {
    await prisma.userSettings.upsert({
      where: { userId: currentUser.id },
      update: {
        autoLogoutEnabled: DEFAULT_SETTINGS.autoLogout.enabled,
        autoLogoutTimeout: DEFAULT_SETTINGS.autoLogout.timeout,
      },
      create: {
        userId: currentUser.id,
        autoLogoutEnabled: DEFAULT_SETTINGS.autoLogout.enabled,
        autoLogoutTimeout: DEFAULT_SETTINGS.autoLogout.timeout,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to reset user settings:", error);
    throw new Error("Failed to reset settings");
  }
}
