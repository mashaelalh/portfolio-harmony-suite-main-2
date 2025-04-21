import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  tags: string[];
  onTagAdd: (tag: string) => void;
  onTagRemove: (index: number) => void;
  maxTags?: number;
  validateTag?: (tag: string) => boolean;
  placeholder?: string;
  className?: string;
  tagClassName?: string;
}

export function TagInput({
  tags,
  onTagAdd,
  onTagRemove,
  maxTags = 10,
  validateTag = (tag) => tag.length > 0,
  placeholder = "Add tags...",
  className,
  tagClassName,
  ...props
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const value = inputValue.trim();

    // Handle backspace to remove last tag when input is empty
    if (event.key === "Backspace" && !value && tags.length > 0) {
      event.preventDefault();
      onTagRemove(tags.length - 1);
    }

    // Handle enter or comma to add tag
    if ((event.key === "Enter" || event.key === ",") && value) {
      event.preventDefault();
      addTag(value);
    }
  };

  const addTag = (value: string) => {
    const normalizedTag = value.trim().toLowerCase();
    
    if (
      normalizedTag &&
      validateTag(normalizedTag) &&
      !tags.includes(normalizedTag) &&
      tags.length < maxTags
    ) {
      onTagAdd(normalizedTag);
      setInputValue("");
    }
  };

  const handleBlur = () => {
    const value = inputValue.trim();
    if (value) {
      addTag(value);
    }
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {tags.map((tag, index) => (
            <motion.div
              key={`${tag}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "group flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm",
                tagClassName
              )}
            >
              <span>{tag}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full opacity-60 ring-offset-background transition-opacity hover:opacity-100"
                onClick={() => onTagRemove(index)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove tag</span>
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={
            tags.length >= maxTags
              ? "Maximum tags reached"
              : `${placeholder} (${tags.length}/${maxTags})`
          }
          disabled={tags.length >= maxTags}
          className="w-full"
          {...props}
        />
        {tags.length >= maxTags && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 left-0 text-xs text-muted-foreground"
          >
            Maximum number of tags reached
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Usage example:
// const [tags, setTags] = React.useState<string[]>([]);
// <TagInput
//   tags={tags}
//   onTagAdd={(tag) => setTags([...tags, tag])}
//   onTagRemove={(index) => setTags(tags.filter((_, i) => i !== index))}
//   maxTags={5}
//   validateTag={(tag) => tag.length >= 2}
//   placeholder="Add skills..."
// />