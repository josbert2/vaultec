"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import { scanAllPasswords } from "@/actions/breach-action";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "./ui/badge";

export function BreachScanDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    scanned: number;
    breached: number;
    breachedPasswords: Array<{
      id: string;
      websiteName: string;
      count: number;
    }>;
  } | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    setProgress(0);
    setResults(null);

    try {
      // Simulate progress (actual scan happens on server)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 95));
      }, 500);

      const result = await scanAllPasswords();

      clearInterval(progressInterval);
      setProgress(100);
      setResults(result);

      if (result.breached === 0) {
        toast.success("Great! No breached passwords found");
      } else {
        toast.warning(`Found ${result.breached} breached password(s)`);
      }
    } catch (error) {
      toast.error("Failed to scan passwords");
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-none">
          <Shield className="mr-2 h-4 w-4" />
          Scan for Breaches
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Scan Passwords for Breaches</DialogTitle>
          <DialogDescription>
            Check all your passwords against the HaveIBeenPwned database to see if
            they've been compromised in known data breaches.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!results && !isScanning && (
            <div className="rounded-md bg-muted p-4 text-sm">
              <p className="font-medium">🔒 Privacy Protected</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                <li>Uses k-Anonymity model - only partial hash sent</li>
                <li>Your actual passwords never leave your device</li>
                <li>Checks against 800M+ breached passwords</li>
                <li>May take 1-2 minutes for large collections</li>
              </ul>
            </div>
          )}

          {isScanning && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Scanning passwords...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                This may take a few minutes. Please don't close this dialog.
              </p>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border border-border p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{results.scanned}</p>
                      <p className="text-sm text-muted-foreground">Scanned</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-md border border-border p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold text-red-500">
                        {results.breached}
                      </p>
                      <p className="text-sm text-muted-foreground">Breached</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breached Passwords List */}
              {results.breachedPasswords.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Compromised Passwords:</h4>
                  <div className="max-h-[200px] space-y-2 overflow-y-auto rounded-md border border-border p-3">
                    {results.breachedPasswords.map((pwd) => (
                      <div
                        key={pwd.id}
                        className="flex items-center justify-between rounded-sm bg-muted p-2"
                      >
                        <span className="font-medium">{pwd.websiteName}</span>
                        <Badge variant="destructive" className="rounded-none">
                          {formatCount(pwd.count)} breaches
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ⚠️ Change these passwords immediately!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!results && (
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full"
            >
              {isScanning ? "Scanning..." : "Start Scan"}
            </Button>
          )}
          {results && (
            <Button
              onClick={() => {
                setIsOpen(false);
                setResults(null);
                setProgress(0);
                // Refresh page to show updated badges
                window.location.reload();
              }}
              className="w-full"
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
