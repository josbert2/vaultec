"use client";

import React from "react";
import { PrivacyProvider } from "@/contexts/privacy-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { useInactivityLogout } from "@/hooks/use-inactivity-logout";
import { SessionWarningDialog } from "@/components/session-warning-dialog";

function LayoutContent({ children }: { children: React.ReactNode }) {
  // Auto-logout based on user settings
  const { showWarning, remainingSeconds, handleStayLoggedIn, handleLogout } = useInactivityLogout();

  return (
    <>
      <div>{children}</div>
      <SessionWarningDialog
        open={showWarning}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogout}
        remainingSeconds={remainingSeconds}
      />
    </>
  );
}

const MainLayout = ({ children }: { children: Readonly<React.ReactNode> }) => {
  return (
    <SettingsProvider>
      <PrivacyProvider>
        <LayoutContent>{children}</LayoutContent>
      </PrivacyProvider>
    </SettingsProvider>
  );
};

export default MainLayout;
