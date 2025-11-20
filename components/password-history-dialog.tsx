"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { History, Clock, User, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { restoreFromHistory } from "@/actions/password-history-action";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface PasswordHistoryEntry {
  id: string;
  oldPassword: string;
  oldEmail: string | null;
  oldUsername: string | null;
  oldUrl: string | null;
  changedAt: Date;
  changeType: "CREATED" | "UPDATED" | "RESTORED";
  user: {
    name: string | null;
    email: string | null;
  };
}

interface PasswordHistoryDialogProps {
  passwordId: string;
  history: PasswordHistoryEntry[];
}

export default function PasswordHistoryDialog({
  passwordId,
  history,
}: PasswordHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>("");
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    if (!selectedHistoryId) return;

    setIsRestoring(true);
    try {
      await restoreFromHistory(selectedHistoryId);
      toast.success("Password restored successfully");
      setRestoreDialogOpen(false);
      setOpen(false);
      // Refresh page to show updated password
      window.location.reload();
    } catch (error) {
      toast.error("Failed to restore password");
      console.error(error);
    } finally {
      setIsRestoring(false);
    }
  };

  const openRestoreDialog = (historyId: string) => {
    setSelectedHistoryId(historyId);
    setRestoreDialogOpen(true);
  };

  const getChangeTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      CREATED: { label: "Created", variant: "default" },
      UPDATED: { label: "Updated", variant: "secondary" },
      RESTORED: { label: "Restored", variant: "outline" },
    };
    const config = variants[type] || variants.UPDATED;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Password History</DialogTitle>
            <DialogDescription>
              View all changes made to this password. You can restore any previous version.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No history available for this password yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {getChangeTypeBadge(entry.changeType)}
                          {index === 0 && (
                            <Badge variant="outline" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {entry.oldEmail && (
                            <div>
                              <span className="font-medium">Email:</span>{" "}
                              <span className="text-muted-foreground">
                                {entry.oldEmail}
                              </span>
                            </div>
                          )}
                          {entry.oldUsername && (
                            <div>
                              <span className="font-medium">Username:</span>{" "}
                              <span className="text-muted-foreground">
                                {entry.oldUsername}
                              </span>
                            </div>
                          )}
                          {entry.oldUrl && (
                            <div className="col-span-2">
                              <span className="font-medium">URL:</span>{" "}
                              <span className="text-muted-foreground">
                                {entry.oldUrl}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(entry.changedAt).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {entry.user.name || entry.user.email}
                          </div>
                        </div>
                      </div>

                      {index !== 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRestoreDialog(entry.id)}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Password Version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the password to this previous version. The current
              version will be saved in the history. This action can be undone by
              restoring another version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? "Restoring..." : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
