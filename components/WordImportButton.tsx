"use client";

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import * as mammoth from "mammoth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface WordImportButtonProps {
  parentDocumentId?: Id<"documents">;
}

export const WordImportButton = ({
  parentDocumentId,
}: WordImportButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const create = useMutation(api.documents.create);
  const update = useMutation(api.documents.update);
  const router = useRouter();

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsLoading(true);

      // Read the Word document
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      // Split text into blocks based on headings and paragraphs
      const blocks = text.split(/\n\s*\n/).filter((block) => block.trim());

      // Create a new document
      const document = await create({
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        parentDocument: parentDocumentId,
      });

      // Convert blocks to BlockNote format
      const blockNoteContent = blocks.map((block) => {
        // Check if it's a heading (starts with #)
        if (block.startsWith("#")) {
          const level = block.match(/^#+/)?.[0].length || 1;
          return {
            type: "heading",
            props: {
              textColor: "default",
              backgroundColor: "default",
              textAlignment: "left",
              level: Math.min(level, 3), // Limit to 3 levels
            },
            content: [
              {
                type: "text",
                text: block.replace(/^#+\s*/, ""),
                styles: {},
              },
            ],
            children: [],
          };
        } else {
          return {
            type: "paragraph",
            props: {
              textColor: "default",
              backgroundColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: block,
                styles: {},
              },
            ],
            children: [],
          };
        }
      });

      // Update the document with the converted content
      await update({
        id: document,
        content: JSON.stringify(blockNoteContent),
      });

      toast.success("Документ успешно импортирован");

      // Navigate to the new document
      router.push(`/documents/${document}`);
    } catch (error) {
      console.error("Error importing Word document:", error);
      toast.error("Ошибка при импорте документа");
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
    },
    maxFiles: 1,
    onDrop,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start font-normal"
        disabled={isLoading}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isLoading ? "Импорт..." : "Импорт Word документа"}
      </Button>
    </div>
  );
};
