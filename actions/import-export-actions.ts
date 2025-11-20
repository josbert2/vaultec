"use server";

import prisma from "@/prisma/db";
import { getCurrentUser } from "./user-action";
import { cryptr } from "@/lib/crypto";
import { createHistoryEntry } from "./password-history-action";

export const importPasswords = async (data: any[]) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) throw new Error("Unauthorized");

        if (!Array.isArray(data)) {
            throw new Error("Invalid data format. Expected an array of passwords.");
        }

        let importedCount = 0;
        let failedCount = 0;

        // Get a default category if needed
        const defaultCategory = await prisma.category.findFirst();
        if (!defaultCategory) throw new Error("No categories found. Please create one first.");

        for (const item of data) {
            try {
                // Basic validation
                if (!item.password || !item.websiteName) {
                    failedCount++;
                    continue;
                }

                const encryptedPassword = cryptr.encrypt(item.password);

                const newPassword = await prisma.password.create({
                    data: {
                        userId: currentUser.id,
                        websiteName: item.websiteName,
                        password: encryptedPassword,
                        username: item.username || undefined,
                        email: item.email || undefined,
                        url: item.url || undefined,
                        notes: item.notes || undefined,
                        categoryId: defaultCategory.id, // Assign to default category for now
                    },
                });

                await createHistoryEntry({
                    passwordId: newPassword.id,
                    oldPassword: encryptedPassword,
                    changeType: "CREATED",
                });

                importedCount++;
            } catch (e) {
                console.error("Failed to import item:", item, e);
                failedCount++;
            }
        }

        return {
            message: `Imported ${importedCount} passwords. Failed: ${failedCount}`,
            importedCount,
            failedCount,
        };
    } catch (error) {
        console.error(error);
        throw new Error("Failed to import passwords");
    }
};

export const exportPasswords = async () => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) throw new Error("Unauthorized");

        const passwords = await prisma.password.findMany({
            where: {
                userId: currentUser.id,
            },
            include: {
                category: true,
            },
        });

        // Decrypt passwords for export
        const exportedData = passwords.map((p) => ({
            websiteName: p.websiteName,
            username: p.username,
            email: p.email,
            password: cryptr.decrypt(p.password),
            url: p.url,
            notes: p.notes,
            category: p.category.name,
            isFavorite: p.isFavorite,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }));

        return exportedData;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to export passwords");
    }
};
