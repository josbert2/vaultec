"use client";

import { useState } from "react";
import Header from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/settings-context";
import { toast } from "sonner";
import { Clock, Lock, Shield } from "lucide-react";
import { ExportImportButtons } from "@/components/export-import-buttons";
import { BreachScanDialog } from "@/components/breach-scan-dialog";

const TIMEOUT_OPTIONS = [
  { label: "1 minute", value: 1 * 60 * 1000 },
  { label: "5 minutes", value: 5 * 60 * 1000 },
  { label: "10 minutes", value: 10 * 60 * 1000 },
  { label: "15 minutes", value: 15 * 60 * 1000 },
  { label: "30 minutes", value: 30 * 60 * 1000 },
  { label: "1 hour", value: 60 * 60 * 1000 },
];

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [autoLogoutEnabled, setAutoLogoutEnabled] = useState(settings.autoLogout.enabled);
  const [autoLogoutTimeout, setAutoLogoutTimeout] = useState(settings.autoLogout.timeout.toString());
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when settings change
  useState(() => {
    setAutoLogoutEnabled(settings.autoLogout.enabled);
    setAutoLogoutTimeout(settings.autoLogout.timeout.toString());
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        autoLogout: {
          enabled: autoLogoutEnabled,
          timeout: parseInt(autoLogoutTimeout),
        },
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      await resetSettings();
      setAutoLogoutEnabled(true);
      setAutoLogoutTimeout((15 * 60 * 1000).toString());
      toast.success("Settings reset to defaults");
    } catch (error) {
      toast.error("Failed to reset settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Header
        title="Settings"
        description="Configure your preferences and security settings."
        className="mt-6"
      />

      <div className="space-y-6">
        {/* Auto-logout Settings */}
        <Card className="rounded-none border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Auto-logout</CardTitle>
            </div>
            <CardDescription>
              Automatically log out after a period of inactivity to protect your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-logout-enabled" className="text-base">
                  Enable auto-logout
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sign out when inactive
                </p>
              </div>
              <Switch
                id="auto-logout-enabled"
                checked={autoLogoutEnabled}
                onCheckedChange={setAutoLogoutEnabled}
              />
            </div>

            {/* Timeout Selector */}
            {autoLogoutEnabled && (
              <div className="space-y-2">
                <Label htmlFor="timeout-select" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Inactivity timeout
                </Label>
                <Select
                  value={autoLogoutTimeout}
                  onValueChange={setAutoLogoutTimeout}
                >
                  <SelectTrigger id="timeout-select">
                    <SelectValue placeholder="Select timeout duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEOUT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  You'll be logged out after this period of inactivity
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Breach Detection Section */}
        <Card className="rounded-none border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Breach Detection</CardTitle>
            </div>
            <CardDescription>
              Check if your passwords have been compromised in data breaches.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Scan for Breaches</h3>
              <p className="text-sm text-muted-foreground">
                Check all your passwords against the HaveIBeenPwned database.
              </p>
              <BreachScanDialog />
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
              <p className="font-medium">🔒 Privacy Protected:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Uses k-Anonymity model</li>
                <li>Only partial password hash sent to API</li>
                <li>Your passwords never leave your device</li>
                <li>Checks against 800M+ breached passwords</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Export/Import Section */}
        <Card className="rounded-none border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Data Management</CardTitle>
            </div>
            <CardDescription>
              Export your passwords for backup or import from another source.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Export & Import</h3>
              <p className="text-sm text-muted-foreground">
                Download your passwords as JSON or CSV, or import from a previous export.
              </p>
              <ExportImportButtons />
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
              <p className="font-medium">📦 Export Formats:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li><strong>JSON:</strong> Complete backup with all metadata (recommended)</li>
                <li><strong>CSV:</strong> Spreadsheet format for viewing in Excel/Sheets</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card className="rounded-none border-border bg-muted/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle className="text-base">Security Tips</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Use the lock button in the header to manually lock your session</p>
            <p>• Press Ctrl/Cmd + H to quickly hide sensitive information</p>
            <p>• Shorter timeout periods provide better security</p>
            <p>• Always lock your session when stepping away from your device</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} className="rounded-none" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button onClick={handleReset} variant="outline" className="rounded-none" disabled={isSaving}>
            Reset to Defaults
          </Button>
        </div>
      </div>
    </>
  );
}
