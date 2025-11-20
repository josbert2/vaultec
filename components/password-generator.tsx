"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Wand2, Copy, RefreshCw } from "lucide-react";
import { generatePassword, DEFAULT_GENERATOR_OPTIONS, PasswordGeneratorOptions } from "@/lib/password-generator";
import { toast } from "sonner";
import { Separator } from "./ui/separator";

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
}

export function PasswordGenerator({ onPasswordGenerated }: PasswordGeneratorProps) {
  const [options, setOptions] = useState<PasswordGeneratorOptions>(DEFAULT_GENERATOR_OPTIONS);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = () => {
    const password = generatePassword(options);
    setGeneratedPassword(password);
    onPasswordGenerated(password);
  };

  const handleCopy = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast.success("Password copied to clipboard");
    }
  };

  const updateOption = <K extends keyof PasswordGeneratorOptions>(
    key: K,
    value: PasswordGeneratorOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Wand2 className="mr-2 h-4 w-4" />
          Generate
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Password Generator</h4>
            <p className="text-sm text-muted-foreground">
              Customize your password settings
            </p>
          </div>

          <Separator />

          {/* Generated Password Display */}
          {generatedPassword && (
            <div className="space-y-2">
              <Label>Generated Password</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={generatedPassword}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Length Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Length: {options.length}</Label>
            </div>
            <Slider
              value={[options.length]}
              onValueChange={([value]) => updateOption("length", value)}
              min={8}
              max={64}
              step={1}
              disabled={options.usePassphrase}
            />
          </div>

          {/* Passphrase Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="passphrase" className="flex flex-col gap-1">
              <span>Use Passphrase</span>
              <span className="text-xs font-normal text-muted-foreground">
                e.g., Correct-Horse-Battery-Staple
              </span>
            </Label>
            <Switch
              id="passphrase"
              checked={options.usePassphrase}
              onCheckedChange={(checked) => updateOption("usePassphrase", checked)}
            />
          </div>

          {!options.usePassphrase && (
            <>
              <Separator />

              {/* Character Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Include Characters</Label>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="uppercase" className="font-normal">
                    Uppercase (A-Z)
                  </Label>
                  <Switch
                    id="uppercase"
                    checked={options.uppercase}
                    onCheckedChange={(checked) => updateOption("uppercase", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="lowercase" className="font-normal">
                    Lowercase (a-z)
                  </Label>
                  <Switch
                    id="lowercase"
                    checked={options.lowercase}
                    onCheckedChange={(checked) => updateOption("lowercase", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="numbers" className="font-normal">
                    Numbers (0-9)
                  </Label>
                  <Switch
                    id="numbers"
                    checked={options.numbers}
                    onCheckedChange={(checked) => updateOption("numbers", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="symbols" className="font-normal">
                    Symbols (!@#$...)
                  </Label>
                  <Switch
                    id="symbols"
                    checked={options.symbols}
                    onCheckedChange={(checked) => updateOption("symbols", checked)}
                  />
                </div>
              </div>

              <Separator />

              {/* Advanced Options */}
              <div className="flex items-center justify-between">
                <Label htmlFor="ambiguous" className="flex flex-col gap-1">
                  <span>Exclude Ambiguous</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Avoid 0, O, 1, l, I
                  </span>
                </Label>
                <Switch
                  id="ambiguous"
                  checked={options.excludeAmbiguous}
                  onCheckedChange={(checked) => updateOption("excludeAmbiguous", checked)}
                />
              </div>
            </>
          )}

          {/* Generate Button */}
          <Button
            type="button"
            onClick={handleGenerate}
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Password
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
