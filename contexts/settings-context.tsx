"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserSettings, updateUserSettings as updateUserSettingsAction, resetUserSettings as resetUserSettingsAction } from "@/actions/settings-action";

export interface UserSettings {
  autoLogout: {
    enabled: boolean;
    timeout: number; // in milliseconds
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  autoLogout: {
    enabled: true,
    timeout: 15 * 60 * 1000, // 15 minutes
  },
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from database on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const dbSettings = await getUserSettings();
        setSettings(dbSettings);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      // Optimistically update UI
      setSettings((prev) => ({
        ...prev,
        ...newSettings,
        autoLogout: {
          ...prev.autoLogout,
          ...(newSettings.autoLogout || {}),
        },
      }));

      // Update in database
      await updateUserSettingsAction(newSettings);
    } catch (error) {
      console.error("Failed to update settings:", error);
      // Reload settings on error
      const dbSettings = await getUserSettings();
      setSettings(dbSettings);
      throw error;
    }
  };

  const resetSettings = async () => {
    try {
      await resetUserSettingsAction();
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error("Failed to reset settings:", error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
