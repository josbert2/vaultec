"use server";

import prisma from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user-action";

/**
 * Toggle favorite status of a password
 */
export const toggleFavorite = async (passwordId: string) => {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser?.id) {
            throw new Error("User not authenticated");
        }

        // Get current password
        const password = await prisma.password.findFirst({
            where: {
                id: passwordId,
                userId: currentUser.id,
            },
        });

        if (!password) {
            throw new Error("Password not found or unauthorized");
        }

        // Toggle favorite
        await prisma.password.update({
            where: { id: passwordId },
            data: {
                isFavorite: !password.isFavorite,
            },
        });

        revalidatePath("/dashboard");

        return {
            success: true,
            isFavorite: !password.isFavorite,
        };
    } catch (error) {
        console.error("Failed to toggle favorite:", error);
        throw new Error("Failed to toggle favorite status");
    }
};

/**
 * Get all favorite passwords for current user
 */
export const getFavoritePasswords = async () => {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser?.id) {
            throw new Error("User not authenticated");
        }

        const favorites = await prisma.password.findMany({
            where: {
                userId: currentUser.id,
                isFavorite: true,
            },
            include: {
                category: true,
                folder: true,
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return favorites;
    } catch (error) {
        console.error("Failed to get favorite passwords:", error);
        throw new Error("Failed to get favorite passwords");
    }
};

/**
 * Get count of favorite passwords
 */
export const getFavoritesCount = async () => {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser?.id) {
            return 0;
        }

        const count = await prisma.password.count({
            where: {
                userId: currentUser.id,
                isFavorite: true,
            },
        });

        return count;
    } catch (error) {
        console.error("Failed to get favorites count:", error);
        return 0;
    }
};
