"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useEdgeStore } from "@/lib/edgestore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { Spinner } from "./Spinner";

interface SingleImageDropzoneProps {
  value?: string;
  onChange?: (value?: string) => void;
  disabled?: boolean;
  className?: string;
}

export const SingleImageDropzone = ({
  value,
  onChange,
  disabled,
  className,
}: SingleImageDropzoneProps) => {
  const { edgestore } = useEdgeStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        const response = await edgestore.publicFiles.upload({
          file,
        });

        onChange?.(response.url);
      } catch (error) {
        console.error(error);
      }
    },
    [edgestore, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "w-full outline-none",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input {...getInputProps()} />
      {value ? (
        <div className="relative w-full h-full">
          <Image
            fill
            className="object-cover rounded-md"
            alt="Upload"
            src={value}
          />
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(undefined);
            }}
            className="absolute top-2 right-2 h-auto w-auto p-1.5"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-y-2">
          <ImagePlus className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Нажмите или перетащите изображение
          </p>
        </div>
      )}
    </div>
  );
};
