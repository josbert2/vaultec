"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./user-action";
import { revalidatePath } from "next/cache";

export interface CreateTagInput {
  name: string;
  color?: string;
}

/**
 * Get all tags for current user
 */
export const getTags = async () => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    const tags = await prisma.tag.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { passwords: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return tags;
  } catch (error) {
    console.error("Error getting tags:", error);
    throw new Error("Failed to get tags");
  }
};

/**
 * Create a new tag
 */
export const createTag = async (input: CreateTagInput) => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    const tag = await prisma.tag.create({
      data: {
        name: input.name,
        color: input.color || "#3b82f6",
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, tag };
  } catch (error) {
    console.error("Error creating tag:", error);
    throw new Error("Failed to create tag");
  }
};

/**
 * Delete a tag
 */
export const deleteTag = async (tagId: string) => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const existing = await prisma.tag.findFirst({
      where: { id: tagId, userId: user.id },
    });

    if (!existing) {
      throw new Error("Tag not found or unauthorized");
    }

    // Delete the tag (PasswordTag entries will be cascade deleted)
    await prisma.tag.delete({
      where: { id: tagId },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Tag deleted successfully" };
  } catch (error) {
    console.error("Error deleting tag:", error);
    throw new Error("Failed to delete tag");
  }
};

/**
 * Add tag to password
 */
export const addTagToPassword = async (passwordId: string, tagId: string) => {
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

    // Verify tag ownership
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, userId: user.id },
    });

    if (!tag) {
      throw new Error("Tag not found or unauthorized");
    }

    // Create the relation (will be ignored if already exists due to unique constraint)
    await prisma.passwordTag.upsert({
      where: {
        passwordId_tagId: {
          passwordId,
          tagId,
        },
      },
      update: {},
      create: {
        passwordId,
        tagId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Tag added to password" };
  } catch (error) {
    console.error("Error adding tag to password:", error);
    throw new Error("Failed to add tag to password");
  }
};

/**
 * Remove tag from password
 */
export const removeTagFromPassword = async (
  passwordId: string,
  tagId: string
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

    // Delete the relation
    await prisma.passwordTag.deleteMany({
      where: {
        passwordId,
        tagId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Tag removed from password" };
  } catch (error) {
    console.error("Error removing tag from password:", error);
    throw new Error("Failed to remove tag from password");
  }
};

/**
 * Set tags for a password (replaces all existing tags)
 */
export const setPasswordTags = async (passwordId: string, tagIds: string[]) => {
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

    // Delete all existing tags for this password
    await prisma.passwordTag.deleteMany({
      where: { passwordId },
    });

    // Add new tags
    if (tagIds.length > 0) {
      await prisma.passwordTag.createMany({
        data: tagIds.map((tagId) => ({
          passwordId,
          tagId,
        })),
      });
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Tags updated successfully" };
  } catch (error) {
    console.error("Error setting password tags:", error);
    throw new Error("Failed to set password tags");
  }
};
