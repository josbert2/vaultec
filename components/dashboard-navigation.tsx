"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useReducer } from "react";
import CategoriesMenu from "./categories-menu";
import DashboardsMenu from "./dashboards-menu";
import { ThemeSwitcher } from "./theme-switcher";
import { Button } from "./ui/button";
import { AlignLeft, Shield, Settings } from "lucide-react";
import Link from "next/link";

const DashboardNavigation = () => {
  const [isOpen, toggleIsOpen] = useReducer((state) => !state, false);

  return (
    <nav className="border-b border-border bg-background px-5 py-2 md:hidden">
      <div className="flex items-center justify-between">
        <Sheet open={isOpen} onOpenChange={toggleIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <AlignLeft className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="overflow-y-auto border-border bg-background">
            <aside className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  PASSWORDS
                </h1>
                <DashboardsMenu variant="MOBILE" toggleIsOpen={toggleIsOpen} />
              </div>
              <div className="space-y-3">
                <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  SECURITY
                </h1>
                <Link
                  href="/dashboard/security-audit"
                  onClick={toggleIsOpen}
                  className="flex items-center gap-3 rounded-none px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Shield className="h-4 w-4" />
                  <span>Security Audit</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={toggleIsOpen}
                  className="flex items-center gap-3 rounded-none px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </div>
              <div className="space-y-3">
                <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  CATEGORIES
                </h1>
                <CategoriesMenu variant="MOBILE" toggleIsOpen={toggleIsOpen} />
              </div>
            </aside>
          </SheetContent>
        </Sheet>

        <ThemeSwitcher />
      </div>
    </nav>
  );
};

export default DashboardNavigation;
