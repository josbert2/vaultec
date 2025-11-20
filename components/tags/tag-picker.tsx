"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CreateTagDialog } from "./create-tag-dialog";

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface TagPickerProps {
  availableTags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  disabled?: boolean;
}

export function TagPicker({
  availableTags,
  selectedTagIds,
  onChange,
  disabled = false,
}: TagPickerProps) {
  const [open, setOpen] = useState(false);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const selectedTags = availableTags.filter((tag) =>
    selectedTagIds.includes(tag.id)
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={disabled}
          >
            {selectedTags.length === 0 ? (
              <span className="text-muted-foreground">Select tags...</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="rounded-sm text-xs"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      borderColor: tag.color || undefined,
                      color: tag.color || undefined,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="flex items-center justify-between border-b p-3">
            <span className="text-sm font-semibold">Select Tags</span>
            <CreateTagDialog />
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {availableTags.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No tags available. Create one!
              </div>
            ) : (
              <div className="space-y-1">
                {availableTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm hover:bg-accent"
                      disabled={disabled}
                    >
                      <Badge
                        variant="secondary"
                        className="rounded-sm"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          borderColor: tag.color || undefined,
                          color: tag.color || undefined,
                        }}
                      >
                        {tag.name}
                      </Badge>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected tags display with remove option */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="gap-1 rounded-sm text-xs"
              style={{
                backgroundColor: `${tag.color}20`,
                borderColor: tag.color || undefined,
                color: tag.color || undefined,
              }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="ml-1 rounded-full hover:bg-black/10"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
