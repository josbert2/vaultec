"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AsciiVariantSelectorProps {
    currentVariant: string;
    onSelect: (variant: string) => void;
}

export default function AsciiVariantSelector({
    currentVariant,
    onSelect,
}: AsciiVariantSelectorProps) {
    const variants = [
        { id: "spotlight", label: "Spotlight" },
        { id: "matrix", label: "Matrix" },
        { id: "wave", label: "Wave" },
        { id: "cube", label: "Cube" },
        { id: "pattern", label: "Minimal" },
        { id: "hands", label: "Hands" },
    ];

    return (
        <div className="fixed bottom-8 right-8 z-50 flex gap-2 rounded-lg border border-zinc-800 bg-black/50 p-2 backdrop-blur-sm">
            {variants.map((variant) => (
                <Button
                    key={variant.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(variant.id)}
                    className={cn(
                        "text-xs text-zinc-400 hover:text-white",
                        currentVariant === variant.id && "bg-white text-black hover:bg-white/90 hover:text-black"
                    )}
                >
                    {variant.label}
                </Button>
            ))}
        </div>
    );
}
