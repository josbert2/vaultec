"use client";

import React, { useReducer, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { LucidePlus } from "lucide-react";
import AddNewPasswoForm from "./forms/add-new-password-form";
import { Category, Folder, Tag } from "@prisma/client";

interface AddNewPasswordDialogProps {
  categories: Category[];
  folders: Folder[];
  tags: Tag[];
}

const AddNewPasswordDialog = ({ categories, folders, tags }: AddNewPasswordDialogProps) => {
  const [isOpen, toggleIsOpen] = useReducer((state) => !state, false);

  return (
    <Sheet onOpenChange={toggleIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-none bg-white text-black hover:bg-zinc-200">
          <LucidePlus className="mr-2 h-4 w-4" />
          Add new password
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l border-border bg-background p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border px-6 py-4 text-left">
          <SheetTitle className="text-2xl font-bold tracking-tight text-foreground">
            Add New Password
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Enter the necessary information to create a new password and save.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AddNewPasswoForm
            categories={categories}
            folders={folders}
            tags={tags}
            toggleIsOpen={toggleIsOpen}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddNewPasswordDialog;
