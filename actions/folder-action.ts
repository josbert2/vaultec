"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./user-action";
import { revalidatePath } from "next/cache";

export interface CreateFolderInput {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateFolderInput {
  id: string;
  name?: string;
  icon?: string;
  color?: string;
}

/**
 * Get all folders for current user
 */
export const getFolders = async () => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    const folders = await prisma.folder.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { passwords: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return folders;
  } catch (error) {
    console.error("Error getting folders:", error);
    throw new Error("Failed to get folders");
  }
};

/**
 * Create a new folder
 */
export const createFolder = async (input: CreateFolderInput) => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    // Get count of existing folders for order
    const count = await prisma.folder.count({
      where: { userId: user.id },
    });

    const folder = await prisma.folder.create({
      data: {
        name: input.name,
        icon: input.icon || "folder",
        color: input.color || "#3b82f6",
        userId: user.id,
        order: count,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, folder };
  } catch (error) {
    console.error("Error creating folder:", error);
    throw new Error("Failed to create folder");
  }
};

/**
 * Update a folder
 */
export const updateFolder = async (input: UpdateFolderInput) => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const existing = await prisma.folder.findFirst({
      where: { id: input.id, userId: user.id },
    });

    if (!existing) {
      throw new Error("Folder not found or unauthorized");
    }

    const folder = await prisma.folder.update({
      where: { id: input.id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.icon && { icon: input.icon }),
        ...(input.color && { color: input.color }),
      },
    });

    revalidatePath("/dashboard");
    return { success: true, folder };
  } catch (error) {
    console.error("Error updating folder:", error);
    throw new Error("Failed to update folder");
  }
};

/**
 * Delete a folder (moves all passwords to null folder)
 */
export const deleteFolder = async (folderId: string) => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const existing = await prisma.folder.findFirst({
      where: { id: folderId, userId: user.id },
    });

    if (!existing) {
      throw new Error("Folder not found or unauthorized");
    }

    // Move all passwords to null (no folder)
    await prisma.password.updateMany({
      where: { folderId },
      data: { folderId: null },
    });

    // Delete the folder
    await prisma.folder.delete({
      where: { id: folderId },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Folder deleted successfully" };
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw new Error("Failed to delete folder");
  }
};

/**
 * Move a password to a folder
 */
export const movePasswordToFolder = async (
  passwordId: string,
  folderId: string | null
) => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    // Verify password ownership
    const password = await prisma.password.findFirst({
      where: { id: passwordId, userId: user.id },
    });

    if (!password) {
      throw new Error("Password not found or unauthorized");
    }

    // If moving to a folder, verify folder ownership
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId: user.id },
      });

      if (!folder) {
        throw new Error("Folder not found or unauthorized");
      }
    }

    // Update password
    await prisma.password.update({
      where: { id: passwordId },
      data: { folderId },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Password moved successfully" };
  } catch (error) {
    console.error("Error moving password:", error);
    throw new Error("Failed to move password");
  }
};

/**
 * Get passwords by folder
 */
export const getPasswordsByFolder = async (folderId: string | null) => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    const passwords = await prisma.password.findMany({
      where: {
        userId: user.id,
        folderId: folderId,
      },
      include: {
        category: true,
        folder: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return passwords;
  } catch (error) {
    console.error("Error getting passwords by folder:", error);
    throw new Error("Failed to get passwords");
  }
};
