"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/actions/favorite-action";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
    passwordId: string;
    isFavorite: boolean;
    size?: "sm" | "default" | "lg" | "icon";
}

export function FavoriteButton({ passwordId, isFavorite, size = "icon" }: FavoriteButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [favorite, setFavorite] = useState(isFavorite);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);
        try {
            const result = await toggleFavorite(passwordId);
            setFavorite(result.isFavorite);
            toast.success(result.isFavorite ? "Added to favorites" : "Removed from favorites");
        } catch (error) {
            toast.error("Failed to update favorite status");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size={size}
            onClick={handleToggle}
            disabled={isLoading}
            className={cn(
                "transition-colors",
                favorite && "text-yellow-500 hover:text-yellow-600"
            )}
        >
            <Star
                className={cn(
                    "h-4 w-4",
                    favorite && "fill-current"
                )}
            />
        </Button>
    );
}
