import { getFolders } from "@/actions/folder-action";
import { Folder } from "lucide-react";
import Link from "next/link";
import { CreateFolderDialog } from "./create-folder-dialog";
import { DeleteFolderButton } from "./delete-folder-button";

export async function FoldersList() {
  const folders = await getFolders();

  return (
    <div className="space-y-2">
      {/* All Passwords Link */}
      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-none px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Folder className="h-4 w-4" />
        <span>All Passwords</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {folders.reduce((acc: number, f: any) => acc + f._count.passwords, 0)}
        </span>
      </Link>

      {/* Folders */}
      {folders.map((folder: any) => (
        <Link
          key={folder.id}
          href={`/dashboard?folder=${folder.id}`}
          className="group flex items-center gap-3 rounded-none px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <div
            className="flex h-4 w-4 items-center justify-center rounded"
            style={{ backgroundColor: folder.color || "#3b82f6" }}
          >
            <Folder className="h-3 w-3 text-white" />
          </div>
          <span className="flex-1 truncate">{folder.name}</span>
          <span className="text-xs text-muted-foreground">
            {folder._count.passwords}
          </span>
          <DeleteFolderButton folderId={folder.id} folderName={folder.name} />
        </Link>
      ))}

      {/* Create Folder Button */}
      <CreateFolderDialog />
    </div>
  );
}
