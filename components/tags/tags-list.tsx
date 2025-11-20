"use client";

import { Tag } from "@prisma/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Tag as TagIcon } from "lucide-react";

interface TagsListProps {
  tags: (Tag & { _count: { passwords: number } })[];
}

export function TagsList({ tags }: TagsListProps) {
  const searchParams = useSearchParams();
  const currentTag = searchParams.get("tag");

  if (tags.length === 0) {
    return (
      <p className="px-3 py-2 text-sm text-muted-foreground">
        No tags yet
      </p>
    );
  }

  return (
    <nav className="space-y-1">
      {tags.map((tag) => {
        const isActive = currentTag === tag.id;
        return (
          <Link
            key={tag.id}
            href={`/dashboard?tag=${tag.id}`}
            className={`flex items-center justify-between rounded-none px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
              isActive ? "bg-accent text-accent-foreground" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: tag.color || "#3b82f6" }}
              />
              <span className="truncate">{tag.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {tag._count.passwords}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
