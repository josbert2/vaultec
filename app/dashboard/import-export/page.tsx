import { Metadata } from "next";
import ImportForm from "@/components/import-export/import-form";
import ExportButton from "@/components/import-export/export-button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
    title: "Import / Export | Passweird",
    description: "Import and export your passwords securely.",
};

export default function ImportExportPage() {
    return (
        <div className="container mx-auto max-w-4xl py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Import / Export</h1>
                <p className="text-muted-foreground">
                    Manage your password data. Import from other managers or export for backup.
                </p>
            </div>

            <Separator />

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold">Import Passwords</h2>
                        <p className="text-sm text-muted-foreground">
                            Import your passwords from a CSV or JSON file.
                        </p>
                    </div>
                    <ImportForm />
                </div>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold">Export Passwords</h2>
                        <p className="text-sm text-muted-foreground">
                            Download a copy of your passwords. Keep this file safe!
                        </p>
                    </div>
                    <ExportButton />
                </div>
            </div>
        </div>
    );
}
