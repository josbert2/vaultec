"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoSearchProps {
    value?: string;
    onChange: (url: string) => void;
}

interface SvglIcon {
    id: number;
    title: string;
    category: string;
    route: string | { light: string; dark: string };
    url: string;
}

export default function LogoSearch({ value, onChange }: LogoSearchProps) {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<SvglIcon[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const searchIcons = async () => {
            if (!search.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`https://api.svgl.app?search=${search}`);
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error("Failed to fetch icons:", error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(searchIcons, 500);
        return () => clearTimeout(debounce);
    }, [search]);

    const handleSelect = (icon: SvglIcon) => {
        const url = typeof icon.route === "string" ? icon.route : icon.route.light;
        onChange(url);
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                {value && (
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-white p-1">
                        <Image
                            src={value}
                            alt="Selected logo"
                            width={40}
                            height={40}
                            className="h-full w-full object-contain"
                            unoptimized
                        />
                        <button
                            onClick={() => onChange("")}
                            className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white hover:bg-destructive/90"
                            type="button"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search logo (e.g. Google, Netflix)..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        className="pl-8"
                    />
                </div>
            </div>

            {isOpen && search && (
                <div className="relative z-50 rounded-md border bg-popover text-popover-foreground shadow-md">
                    <ScrollArea className="h-[200px] p-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                                Searching...
                            </div>
                        ) : results.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2">
                                {results.slice(0, 20).map((icon) => {
                                    const url = typeof icon.route === "string" ? icon.route : icon.route.light;
                                    return (
                                        <Button
                                            key={icon.id}
                                            variant="outline"
                                            className={cn(
                                                "h-16 w-full flex-col gap-1 p-1",
                                                value === url && "border-primary bg-primary/5"
                                            )}
                                            onClick={() => handleSelect(icon)}
                                            type="button"
                                        >
                                            <div className="relative h-8 w-8">
                                                <Image
                                                    src={url}
                                                    alt={icon.title}
                                                    fill
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            </div>
                                            <span className="w-full truncate text-[10px] text-muted-foreground">
                                                {icon.title}
                                            </span>
                                        </Button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                                No results found.
                            </div>
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
