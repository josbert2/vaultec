import { User } from "@prisma/client";
import { Account } from "./account";
import CategoriesMenu from "./categories-menu";
import DashboardsMenu from "./dashboards-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Shield, Settings, Star } from "lucide-react";
import { FoldersList } from "./folders/folders-list";
import { TagsList } from "./tags/tags-list";
import { getTags } from "@/actions/tag-action";
import { getFavoritesCount } from "@/actions/favorite-action";

interface SidebarProps {
  currentUser: User | null;
}

const Sidebar = async ({ currentUser }: SidebarProps) => {
  const [tags, favoritesCount] = await Promise.all([
    getTags(),
    getFavoritesCount(),
  ]);

  return (
    <ScrollArea>
      <aside className="flex max-h-screen border-r border-border bg-background px-5 py-4">
        <div className="w-full space-y-8">
          <Account currentUser={currentUser} />
          <div className="space-y-3">
            <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              PASSWORDS
            </h1>
            <DashboardsMenu variant="DESKTOP" />
          </div>

          <div className="space-y-3">
            <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              FAVORITES
            </h1>
            <Link
              href="/dashboard?favorites=true"
              className="flex items-center gap-3 rounded-none px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Star className="h-4 w-4" />
              <span className="flex-1">Starred</span>
              {favoritesCount > 0 && (
                <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {favoritesCount}
                </span>
              )}
            </Link>
          </div>

          <div className="space-y-3">
            <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              FOLDERS
            </h1>
            <FoldersList />
          </div>

          <div className="space-y-3">
            <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              TAGS
            </h1>
            <TagsList tags={tags} />
          </div>

          <div className="space-y-3">
            <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              SECURITY
            </h1>
            <Link
              href="/dashboard/security-audit"
              className="flex items-center gap-3 rounded-none px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Shield className="h-4 w-4" />
              <span>Security Audit</span>
            </Link>
          </div>

          <div className="space-y-3">
            <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              SETTINGS
            </h1>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-none px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-4 w-4" />
              <span>Preferences</span>
            </Link>
          </div>

          <div className="space-y-3">
            <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              CATEGORIES
            </h1>
            <CategoriesMenu variant="DESKTOP" />
          </div>
        </div>
      </aside>
    </ScrollArea>
  );
};

export default Sidebar;
