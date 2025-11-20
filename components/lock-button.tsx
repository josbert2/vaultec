"use client";

import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LockButton() {
  const router = useRouter();

  const handleLock = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLock}
          >
            <Lock className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Lock session</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
