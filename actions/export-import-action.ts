"use server";

import { getCurrentUser } from "./user-action";
import { prisma } from "@/lib/prisma";
import { cryptr } from "@/lib/crypto";

export interface ExportedPassword {
  websiteName: string;
  url: string | null;
  username: string | null;
  email: string | null;
  password: string;
  notes: string | null;
  category: string | null;
  folder: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export async function exportPasswords(format: "json" | "csv" = "json") {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  try {
    const passwords = await prisma.password.findMany({
      where: { userId: currentUser.id },
      include: {
        category: true,
        folder: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const exportedData: ExportedPassword[] = passwords.map((pwd) => ({
      websiteName: pwd.websiteName,
      url: pwd.url,
      username: pwd.username,
      email: pwd.email,
      password: pwd.password, // Already decrypted in DB
      notes: pwd.notes,
      category: pwd.category?.name || null,
      folder: pwd.folder?.name || null,
      tags: pwd.tags.map((t) => t.tag.name),
      createdAt: pwd.createdAt.toISOString(),
      updatedAt: pwd.updatedAt.toISOString(),
    }));

    if (format === "csv") {
      return convertToCSV(exportedData);
    }

    return {
      version: "1.0",
      exportDate: new Date().toISOString(),
      totalPasswords: exportedData.length,
      passwords: exportedData,
    };
  } catch (error) {
    console.error("Failed to export passwords:", error);
    throw new Error("Failed to export passwords");
  }
}

function convertToCSV(data: ExportedPassword[]): string {
  const headers = [
    "Website Name",
    "URL",
    "Username",
    "Email",
    "Password",
    "Notes",
    "Category",
    "Folder",
    "Tags",
    "Created At",
    "Updated At",
  ];

  const rows = data.map((pwd) => [
    pwd.websiteName,
    pwd.url || "",
    pwd.username || "",
    pwd.email || "",
    pwd.password,
    pwd.notes || "",
    pwd.category || "",
    pwd.folder || "",
    pwd.tags.join("; "),
    pwd.createdAt,
    pwd.updatedAt,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}

export async function importPasswords(jsonData: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  try {
    const data = JSON.parse(jsonData);

    if (!data.passwords || !Array.isArray(data.passwords)) {
      throw new Error("Invalid import format");
    }

    const imported: ExportedPassword[] = data.passwords;
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const pwd of imported) {
      try {
        // Validate required fields
        if (!pwd.websiteName || !pwd.password) {
          errors.push(`Skipped: Missing required fields for ${pwd.websiteName || "unknown"}`);
          errorCount++;
          continue;
        }

        // Find or create category
        let categoryId = null;
        if (pwd.category) {
          const category = await prisma.category.findFirst({
            where: {
              name: pwd.category,
              userId: currentUser.id,
            },
          });
          categoryId = category?.id || null;
        }

        // Find or create folder
        let folderId = null;
        if (pwd.folder) {
          let folder = await prisma.folder.findFirst({
            where: {
              name: pwd.folder,
              userId: currentUser.id,
            },
          });

          if (!folder) {
            folder = await prisma.folder.create({
              data: {
                name: pwd.folder,
                color: "#3b82f6",
                userId: currentUser.id,
              },
            });
          }
          folderId = folder.id;
        }

        // Create password
        const newPassword = await prisma.password.create({
          data: {
            websiteName: pwd.websiteName,
            url: pwd.url,
            username: pwd.username,
            email: pwd.email,
            password: pwd.password,
            notes: pwd.notes,
            userId: currentUser.id,
            categoryId,
            folderId,
          },
        });

        // Handle tags
        if (pwd.tags && pwd.tags.length > 0) {
          for (const tagName of pwd.tags) {
            let tag = await prisma.tag.findFirst({
              where: {
                name: tagName,
                userId: currentUser.id,
              },
            });

            if (!tag) {
              tag = await prisma.tag.create({
                data: {
                  name: tagName,
                  color: "#3b82f6",
                  userId: currentUser.id,
                },
              });
            }

            await prisma.passwordTag.create({
              data: {
                passwordId: newPassword.id,
                tagId: tag.id,
              },
            });
          }
        }

        successCount++;
      } catch (error) {
        console.error(`Failed to import password: ${pwd.websiteName}`, error);
        errors.push(`Failed to import: ${pwd.websiteName}`);
        errorCount++;
      }
    }

    return {
      success: true,
      imported: successCount,
      failed: errorCount,
      errors,
    };
  } catch (error) {
    console.error("Failed to import passwords:", error);
    throw new Error("Failed to import passwords");
  }
}
