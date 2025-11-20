"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { importPasswords } from "@/actions/import-export-actions";
import { UploadCloud } from "lucide-react";

export default function ImportForm() {
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast.error("Please select a file to import");
            return;
        }

        setIsImporting(true);
        try {
            const text = await file.text();
            let data;

            if (file.name.endsWith(".json")) {
                data = JSON.parse(text);
            } else if (file.name.endsWith(".csv")) {
                // Simple CSV parsing (can be improved)
                const lines = text.split("\n");
                const headers = lines[0].split(",").map((h) => h.trim());
                data = lines.slice(1).filter(l => l.trim()).map((line) => {
                    const values = line.split(",");
                    const entry: any = {};
                    headers.forEach((header, i) => {
                        entry[header] = values[i]?.trim();
                    });
                    return entry;
                });
            } else {
                throw new Error("Unsupported file format. Please use .json or .csv");
            }

            const result = await importPasswords(data);
            toast.success(result.message);
            setFile(null);
            // Reset file input
            const fileInput = document.getElementById("file-upload") as HTMLInputElement;
            if (fileInput) fileInput.value = "";
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to import passwords");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="rounded-lg border p-6 space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="file-upload">File</Label>
                <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileChange}
                    disabled={isImporting}
                />
            </div>
            <Button onClick={handleImport} disabled={!file || isImporting} className="w-full">
                {isImporting ? (
                    "Importing..."
                ) : (
                    <>
                        <UploadCloud className="mr-2 h-4 w-4" /> Import
                    </>
                )}
            </Button>
            <p className="text-xs text-muted-foreground">
                Supported formats: JSON, CSV.
            </p>
        </div>
    );
}
