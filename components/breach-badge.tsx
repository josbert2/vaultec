"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface BreachBadgeProps {
  isBreached: boolean;
  breachCount: number;
}

export function BreachBadge({ isBreached, breachCount }: BreachBadgeProps) {
  if (!isBreached) return null;

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="destructive"
            className="gap-1 rounded-none bg-red-600 hover:bg-red-700"
          >
            <AlertTriangle className="h-3 w-3" />
            <span className="text-xs">Breached</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">⚠️ Password Compromised</p>
            <p className="text-sm">
              Found in {formatCount(breachCount)} data breaches
            </p>
            <p className="text-xs text-muted-foreground">
              Change this password immediately
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
