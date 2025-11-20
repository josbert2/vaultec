"use server";

import { TRegister, registerSchema } from "@/lib/validators/auth-schema";
import prisma from "@/prisma/db";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

type RegisterResult =
  | { success: true; message: string }
  | { success: false; error: string };

export const registerAction = async (
  values: TRegister,
): Promise<RegisterResult> => {
  const validation = registerSchema.safeParse(values);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues.at(0)?.message ?? "Validation failed",
    };
  }

  const { email, username, password } = values;

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    await prisma.user.create({
      data: { name: username, hashedPassword, email },
    });

    return {
      success: true,
      message: "Create new user successfully",
    };
  } catch (error) {
    // Log the full error for debugging
    console.error("Registration error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (
          error.meta as { modelName: string; target: string[] }
        ).target?.at(0);
        return {
          success: false,
          error: `The ${target} you have chosen is already in use.`,
        };
      }
    }

    return {
      success: false,
      error: "Failed to register user. Please try again later.",
    };
  }
};
