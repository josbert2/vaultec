"use client";

import {
  TPasswordSchema,
  passwordSchema,
} from "@/lib/validators/password-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Prisma, Folder, Tag } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import CategoryIcon from "../category-icon";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import LogoSearch from "../logo-search";
import { editPassword } from "@/actions/password-action";
import { SetStateAction, useReducer, useState } from "react";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { TagPicker } from "../tags/tag-picker";
import { PasswordStrengthIndicator } from "../password-strength-indicator";
import { PasswordGenerator } from "../password-generator";

interface EditPasswordFormProps {
  toggleIsOpen: React.DispatchWithoutAction;
  categories: Category[];
  folders: Folder[];
  tags: Tag[];
  password: Prisma.PasswordGetPayload<{
    include: {
      category: true;
    };
  }>;
}

const EditPasswordForm = ({
  password,
  categories,
  folders,
  tags,
  toggleIsOpen,
}: EditPasswordFormProps) => {
  const [seePassword, toggleSeePassword] = useReducer((state) => !state, false);

  const form = useForm<TPasswordSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      websiteName: password.websiteName,
      username: password?.username || undefined,
      email: password?.email || undefined,
      password: password.password,
      url: password?.url || undefined,
      category: password.categoryId,
      folderId: password.folderId || "",
      tagIds: [],
      notes: password.notes || undefined,
      isFavorite: password.isFavorite,
      logoUrl: password.logoUrl || undefined,
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (values: TPasswordSchema) =>
      await editPassword({ id: password.id, values: { ...values } })
        .then((callback) => {
          toast.success(callback.message);
          toggleIsOpen();
        })
        .catch((error) => {
          toast.error(error.message);
        }),
  });

  const onSubmit = async (values: TPasswordSchema) => {
    mutateAsync(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger autoFocus disabled={isPending}>
                    <SelectValue placeholder="Select Categories" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category, index) => (
                    <SelectItem
                      disabled={isPending}
                      key={index}
                      value={category.id}
                      className="capitalize"
                    >
                      <CategoryIcon
                        category={category.slug}
                        className="mr-3 inline-flex"
                      />
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="folderId"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Folder <span className="text-zinc-500">(Optional)</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={isPending} className="capitalize">
                    <SelectValue placeholder="Select Folder" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper" sideOffset={5}>
                  <SelectItem value="none" className="text-muted-foreground">
                    No Folder
                  </SelectItem>
                  {folders.map((folder) => (
                    <SelectItem
                      key={folder.id}
                      value={folder.id}
                      className="capitalize"
                    >
                      <span
                        className="mr-3 inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: folder.color || "#3b82f6" }}
                      />
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagIds"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags <span className="text-zinc-500">(Optional)</span></FormLabel>
              <FormControl>
                <TagPicker
                  availableTags={tags}
                  selectedTagIds={field.value || []}
                  onChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logoUrl"
          disabled={isPending}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <LogoSearch value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter website name"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email <span className="text-zinc-500">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter email address"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Username <span className="text-zinc-500">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter username"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      type={seePassword ? "text" : "password"}
                      placeholder="Enter password"
                      disabled={isPending}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={toggleSeePassword}
                    >
                      {seePassword ? (
                        <EyeOffIcon className="h-4 w-4 text-zinc-700" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-zinc-700" />
                      )}
                    </Button>
                    <PasswordGenerator
                      onPasswordGenerated={(pwd) => {
                        field.onChange(pwd);
                      }}
                    />
                  </div>
                  <PasswordStrengthIndicator
                    password={field.value}
                    showRequirements={true}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Update the password for this account.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                URL <span className="text-zinc-500">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter website URL"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Notes <span className="text-zinc-500">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any notes"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isFavorite"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Favorite</FormLabel>
                <FormDescription>
                  Mark this password as a favorite to access it quickly.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
};

export default EditPasswordForm;
