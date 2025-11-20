"use client";

import { Prisma } from "@prisma/client";
import Link from "next/link";
import { Button } from "./ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useReducer } from "react";
import { maskPassword } from "@/lib/mask-password";
import { usePrivacy } from "@/contexts/privacy-context";
import { cn } from "@/lib/utils";

interface PasswordContentProps {
  password: Prisma.PasswordGetPayload<{
    include: {
      category: true;
    };
  }>;
}

const PasswordContent = ({ password }: PasswordContentProps) => {
  const [passwordMask, togglePasswordMask] = useReducer(
    (state) => !state,
    true,
  );
  const { isPrivacyMode } = usePrivacy();

  return (
    <div className="space-y-0.5 rounded-lg border p-4">
      {password.username ? (
        <p>
          Username:{" "}
          <span
            className={cn(
              "transition-all duration-200",
              isPrivacyMode && "blur-sm select-none"
            )}
          >
            {password.username}
          </span>
        </p>
      ) : null}
      {password.email ? (
        <p>
          Email:{" "}
          <Link
            href={`mailto:${password?.email}`}
            className={cn(
              "transition-all duration-300 hover:underline",
              isPrivacyMode && "blur-sm select-none pointer-events-none"
            )}
          >
            {password?.email}
          </Link>
        </p>
      ) : null}
      <p className="inline-flex items-center">
        Password:{" "}
        <span
          className={cn(
            "transition-all duration-200",
            isPrivacyMode && "blur-sm select-none"
          )}
        >
          {!passwordMask ? password.password : maskPassword(8)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-0.5"
          onClick={togglePasswordMask}
          disabled={isPrivacyMode}
        >
          {passwordMask ? (
            <EyeIcon className="h-4 w-4" />
          ) : (
            <EyeOffIcon className="h-4 w-4" />
          )}
        </Button>
      </p>
      {password.url ? (
        <p>
          URL:{" "}
          <Link
            href={password?.url as string}
            className={cn(
              "transition-all duration-300 hover:underline",
              isPrivacyMode && "blur-sm select-none pointer-events-none"
            )}
          >
            {password?.url}
          </Link>
        </p>
      ) : null}
      {password.notes ? (
        <div className="mt-2 border-t pt-2">
          <p className="font-medium">Notes:</p>
          <p
            className={cn(
              "whitespace-pre-wrap text-sm text-muted-foreground transition-all duration-200",
              isPrivacyMode && "blur-sm select-none"
            )}
          >
            {password.notes}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default PasswordContent;
