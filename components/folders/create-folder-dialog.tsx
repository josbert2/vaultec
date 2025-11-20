"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus } from "lucide-react";
import { createFolder } from "@/actions/folder-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const FOLDER_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // orange
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#6366f1", // indigo
];

const FOLDER_ICONS = [
  "folder",
  "briefcase",
  "home",
  "star",
  "heart",
  "shield",
  "lock",
  "code",
];

export function CreateFolderDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [selectedIcon, setSelectedIcon] = useState("folder");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setLoading(true);
    try {
      await createFolder({
        name: name.trim(),
        color: selectedColor,
        icon: selectedIcon,
      });
      
      toast.success("Folder created successfully");
      setOpen(false);
      setName("");
      setSelectedColor("#3b82f6");
      setSelectedIcon("folder");
      router.refresh();
    } catch (error) {
      toast.error("Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-none px-3 text-sm"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Organize your passwords into custom folders.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Folder Name</Label>
              <Input
                id="name"
                placeholder="e.g., Work, Personal, Banking..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      selectedColor === color
                        ? "scale-110 ring-2 ring-offset-2"
                        : "hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: color,
                      ringColor: color,
                    }}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Icon (coming soon)</Label>
              <div className="text-sm text-muted-foreground">
                Icon selection will be available in the next update.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
