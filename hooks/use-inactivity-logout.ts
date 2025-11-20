"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/contexts/settings-context";

export function useInactivityLogout() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { settings } = useSettings();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const resetTimer = () => {
    // Don't reset if warning is already showing
    if (showWarning) return;

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    if (settings.autoLogout.enabled) {
      // Calculate warning time (50% of timeout)
      const warningTime = settings.autoLogout.timeout / 2;
      const remainingTime = settings.autoLogout.timeout - warningTime;

      // Set warning timer (at 50% of timeout)
      warningTimeoutRef.current = setTimeout(() => {
        setShowWarning(true);
        setRemainingSeconds(Math.floor(remainingTime / 1000));
      }, warningTime);

      // Set logout timer (at 100% of timeout)
      timeoutRef.current = setTimeout(() => {
        handleLogout();
      }, settings.autoLogout.timeout);
    }
  };

  const handleLogout = async () => {
    setShowWarning(false);
    await signOut({ redirect: false });
    router.push("/sign-in");
  };

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    // Restart the full timer
    resetTimer();
  };

  useEffect(() => {
    if (!settings.autoLogout.enabled) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];

    const handleActivity = () => {
      // Only reset timer if warning is not showing
      if (!showWarning) {
        resetTimer();
      }
    };

    // Set initial timer
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [settings.autoLogout.enabled, settings.autoLogout.timeout, showWarning]);

  return {
    handleLogout,
    showWarning,
    remainingSeconds,
    handleStayLoggedIn,
  };
}
