"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { exportPasswords } from "@/actions/import-export-actions";
import { DownloadCloud } from "lucide-react";

export default function ExportButton() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const data = await exportPasswords();

            // Create a blob and download it
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `passweird-export-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Passwords exported successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to export passwords");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="rounded-lg border p-6 space-y-4">
            <Button onClick={handleExport} disabled={isExporting} variant="outline" className="w-full">
                {isExporting ? (
                    "Exporting..."
                ) : (
                    <>
                        <DownloadCloud className="mr-2 h-4 w-4" /> Export to JSON
                    </>
                )}
            </Button>
            <p className="text-xs text-muted-foreground">
                Export includes all your passwords in a decrypted JSON format. Keep it safe!
            </p>
        </div>
    );
}
