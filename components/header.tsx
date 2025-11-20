import { cn } from "@/lib/utils";
import React from "react";
import { ThemeSwitcher } from "./theme-switcher";
import { PrivacyToggle } from "./privacy-toggle";
import { LockButton } from "./lock-button";

interface HeaderProps {
  title: string;
  description: string;
  className?: string;
}

const Header = ({ title, description, className }: HeaderProps) => {
  return (
    <header
      className={cn(
        "relative mb-8 flex items-center justify-between pr-3",
        className,
      )}
    >
      <div className="space-y-2">
        <h1 className="text-5xl font-bold tracking-tighter text-foreground md:text-6xl">
          {title}
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">{description}</p>
      </div>

      <div className="flex items-center gap-2">
        <LockButton />
        <PrivacyToggle />
        <ThemeSwitcher className="hidden md:flex" />
      </div>
    </header>
  );
};

export default Header;
