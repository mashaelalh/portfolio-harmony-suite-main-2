import React, { useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

interface FileUploadProps {
  label: string;
  onChange: (file: File | null) => void;
  className?: string;
  wrapperClassName?: string;
  id?: string;
  existingFileUrl?: string; // Optional URL for an existing file
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onChange,
  className,
  wrapperClassName,
  id,
  existingFileUrl,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingFileUrl || null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
    onChange(file); // Pass the file to the parent component

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleClear = () => {
    setFile(null);
    onChange(null); // Clear the file in the parent component
    setPreviewUrl(null);
  };

  const fileInputId = id || React.useId();

  return (
    <div className={cn("space-y-2", wrapperClassName)}>
      <Label htmlFor={fileInputId} className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center space-x-2">
        <Button variant="outline" asChild>
          <label htmlFor={fileInputId} className="flex items-center gap-2 px-3 py-2 rounded-md border text-sm text-muted-foreground hover:bg-muted cursor-pointer">
            <UploadCloud className="h-4 w-4" />
            Upload
          </label>
        </Button>
        <input
          type="file"
          id={fileInputId}
          className="hidden"
          onChange={handleChange}
        />
        {file && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            aria-label="Clear file"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear file</span>
          </Button>
        )}
      </div>
      {previewUrl && (
        <div className="mt-2">
          {/* Display image preview if it's an image */}
          {file && file.type.startsWith('image/') ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-40 rounded-md border"
            />
          ) : (
            <p className="text-sm text-muted-foreground">File: {file.name}</p>
          )}
        </div>
      )}
    </div>
  );
};

export { FileUpload };