"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { usePrivacy } from "@/contexts/privacy-context";

export function PrivacyToggle() {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePrivacyMode}
            className="relative"
          >
            {isPrivacyMode ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            {isPrivacyMode ? "Show" : "Hide"} sensitive info
          </p>
          <p className="text-xs text-muted-foreground">
            {typeof window !== "undefined" && navigator.platform.includes("Mac")
              ? "⌘"
              : "Ctrl"}{" "}
            + H
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
