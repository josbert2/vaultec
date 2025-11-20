"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Download, Upload, FileJson, FileSpreadsheet } from "lucide-react";
import { exportPasswords, importPasswords } from "@/actions/export-import-action";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export function ExportImportButtons() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const data = await exportPasswords("json");
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vaultec-passwords-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Passwords exported successfully");
    } catch (error) {
      toast.error("Failed to export passwords");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csvData = await exportPasswords("csv");
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vaultec-passwords-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Passwords exported to CSV successfully");
    } catch (error) {
      toast.error("Failed to export passwords");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error("Please paste your JSON data");
      return;
    }

    setIsImporting(true);
    try {
      const result = await importPasswords(importData);
      toast.success(
        `Import complete! ${result.imported} imported, ${result.failed} failed`
      );
      if (result.errors.length > 0) {
        console.log("Import errors:", result.errors);
      }
      setShowImportDialog(false);
      setImportData("");
      // Refresh the page to show new passwords
      window.location.reload();
    } catch (error) {
      toast.error("Failed to import passwords. Check the format.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Export Buttons */}
      <Button
        onClick={handleExportJSON}
        variant="outline"
        className="rounded-none"
        disabled={isExporting}
      >
        <FileJson className="mr-2 h-4 w-4" />
        {isExporting ? "Exporting..." : "Export JSON"}
      </Button>

      <Button
        onClick={handleExportCSV}
        variant="outline"
        className="rounded-none"
        disabled={isExporting}
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        {isExporting ? "Exporting..." : "Export CSV"}
      </Button>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="rounded-none">
            <Upload className="mr-2 h-4 w-4" />
            Import JSON
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import Passwords</DialogTitle>
            <DialogDescription>
              Paste your exported JSON data below. This will import all passwords,
              creating folders and tags as needed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-data">JSON Data</Label>
              <Textarea
                id="import-data"
                placeholder='{"version": "1.0", "passwords": [...]}'
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={10}
                className="font-mono text-xs"
              />
            </div>
            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <p className="font-medium">⚠️ Important:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Only JSON format is supported for import</li>
                <li>Existing passwords won't be duplicated</li>
                <li>Missing folders and tags will be created automatically</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? "Importing..." : "Import Passwords"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
