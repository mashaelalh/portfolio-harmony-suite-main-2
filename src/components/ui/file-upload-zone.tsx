import * as React from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, FileIcon, ImageIcon, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileUploadZoneProps {
  onFileSelect: (files: File[]) => void;
  onFileRemove?: (file: File) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  uploading?: boolean;
  progress?: number;
  existingFiles?: File[];
}

export function FileUploadZone({
  onFileSelect,
  onFileRemove,
  acceptedFileTypes = ["image/*", "application/pdf"],
  maxFiles = 5,
  maxSize = 5242880, // 5MB
  className,
  uploading = false,
  progress = 0,
  existingFiles = [],
}: FileUploadZoneProps) {
  const [files, setFiles] = React.useState<File[]>(existingFiles);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      setFiles(newFiles);
      onFileSelect(newFiles);
    },
    [files, maxFiles, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    maxFiles: maxFiles - files.length,
    maxSize,
  });

  const removeFile = (file: File) => {
    const newFiles = files.filter((f) => f !== file);
    setFiles(newFiles);
    onFileRemove?.(file);
  };

  const isImage = (file: File) => file.type.startsWith("image/");

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-lg border-2 border-dashed p-8 transition-colors",
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/25 hover:border-primary/50",
          files.length >= maxFiles && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <div className="text-sm">
            {isDragActive ? (
              <p className="text-primary">Drop files here...</p>
            ) : (
              <>
                <p>
                  Drag & drop files here, or{" "}
                  <span className="text-primary">browse</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {acceptedFileTypes.join(", ")} (max {formatFileSize(maxSize)})
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-4 rounded-lg border p-3"
              >
                {isImage(file) ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <FileIcon className="h-10 w-10 text-muted-foreground" />
                )}
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground text-center">
            Uploading... {progress}%
          </p>
        </motion.div>
      )}
    </div>
  );
}