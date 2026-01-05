"use server";

import {
  passwordSchema,
  TPasswordSchema,
} from "@/lib/validators/password-schema";
import prisma from "@/prisma/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user-action";
import { cryptr } from "@/lib/crypto";
import { createHistoryEntry } from "./password-history-action";

export const getPasswordCollection = async (param?: {
  category?: string;
  search?: string;
  folder?: string;
  tag?: string;
  favorites?: string;
}) => {
  try {
    const currentUser = await getCurrentUser();

    const whereClause: Prisma.PasswordWhereInput = {
      userId: currentUser?.id,
    };

    if (param?.category) {
      whereClause.category = { slug: param.category };
    }

    if (param?.search) {
      whereClause.OR = [
        { websiteName: { contains: param.search } },
        { email: { contains: param.search } },
        { username: { contains: param.search } },
      ];
    }

    if (param?.folder) {
      whereClause.folderId = param.folder;
    }

    if (param?.tag) {
      whereClause.tags = {
        some: {
          tagId: param.tag,
        },
      };
    }

    if (param?.favorites === "true") {
      whereClause.isFavorite = true;
    }

    const passwordCollection = await prisma.password.findMany({
      where: whereClause,
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
        createdAt: "desc",
      },
    });

    return passwordCollection;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get password collection");
  }
};

export const addNewPassword = async (values: TPasswordSchema) => {
  const currentUser = await getCurrentUser();

  // validation
  const validation = passwordSchema.safeParse({ ...values });
  if (!validation.success) {
    throw new Error(validation.error.issues.at(0)?.message);
  }

  const { category, folderId, tagIds, email, password, url, websiteName, username } = values;

  const cryptedPassword = cryptr.encrypt(password);

  try {
    const newPassword = await prisma.password.create({
      data: {
        password: cryptedPassword,
        websiteName: websiteName.toLowerCase(),
        email: email.toLowerCase() || undefined,
        username: username?.toLowerCase() || undefined,
        categoryId: category,
        folderId: folderId || null,
        userId: currentUser?.id as string,
        url: url.toLowerCase() || undefined,
        notes: values.notes || undefined,
        isFavorite: values.isFavorite || false,
        logoUrl: values.logoUrl || undefined,
      },
    });

    // Create history entry for new password
    await createHistoryEntry({
      passwordId: newPassword.id,
      oldPassword: cryptedPassword,
      oldEmail: newPassword.email,
      oldUsername: newPassword.username,
      oldUrl: newPassword.url,
      changeType: "CREATED",
    });

    // Assign tags if provided
    if (tagIds && tagIds.length > 0) {
      await prisma.passwordTag.createMany({
        data: tagIds.map((tagId) => ({
          passwordId: newPassword.id,
          tagId,
        })),
      });
    }

    revalidatePath("/dashboard");

    return {
      message: "create new password successfully",
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create new password");
  }
};

export const deletePassword = async (collectionId: string) => {
  try {
    await prisma.password.delete({
      where: { id: collectionId },
    });

    revalidatePath("/dashboard");

    return {
      message: "Password delete successfully",
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete password collection");
  }
};

export const totalUserPasswordSaved = async () => {
  const currentUser = await getCurrentUser();

  try {
    const total = await prisma.password.count({
      where: {
        userId: currentUser?.id,
      },
    });

    return total;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get total password");
  }
};

export const editPassword = async (param: {
  values: TPasswordSchema;
  id: string;
}) => {
  const {
    id,
    values: { category, folderId, tagIds, email, password, url, websiteName, username, notes, isFavorite, logoUrl },
  } = param;

  const passwordExists = await getPassword({ id });

  if (!passwordExists) throw new Error("Password not found");

  const encryptedPassword = cryptr.encrypt(password);

  try {
    // Save current state to history before updating
    await createHistoryEntry({
      passwordId: passwordExists.id,
      oldPassword: passwordExists.password,
      oldEmail: passwordExists.email,
      oldUsername: passwordExists.username,
      oldUrl: passwordExists.url,
      changeType: "UPDATED",
    });

    await prisma.password.update({
      where: { id: passwordExists.id },
      data: {
        websiteName,
        password: encryptedPassword,
        email: email || undefined,
        username: username || undefined,
        url: url || undefined,
        notes: notes || undefined,
        isFavorite: isFavorite || false,
        logoUrl: logoUrl || undefined,
        category: {
          connect: {
            id: category,
          },
        },
        folder: folderId ? {
          connect: {
            id: folderId
          }
        } : {
          disconnect: true
        }
      },
    });

    // Update tags
    if (tagIds !== undefined) {
      // Delete all existing tags
      await prisma.passwordTag.deleteMany({
        where: { passwordId: id },
      });

      // Add new tags
      if (tagIds.length > 0) {
        await prisma.passwordTag.createMany({
          data: tagIds.map((tagId) => ({
            passwordId: id,
            tagId,
          })),
        });
      }
    }

    revalidatePath("/dashboard");

    return {
      message: "Update password successfully",
    };
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
    throw new Error("Failed to update password");
  }
};

export const getPassword = async (where: Prisma.PasswordWhereInput) => {
  try {
    const password = await prisma.password.findFirst({ where });
    return password;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get passwod");
  }
};
