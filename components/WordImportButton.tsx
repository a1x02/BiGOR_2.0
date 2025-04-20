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
import { useEdgeStore } from "@/lib/edgestore";

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
  const { edgestore } = useEdgeStore();

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const toastId = toast.loading("Импортируем документ...");
    try {
      setIsLoading(true);

      // Read the Word document with style information
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      // Create a temporary div to parse HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // Process each element
      const processElement = async (element: Element): Promise<any> => {
        const blockNoteContent: any[] = [];
        let currentText = "";

        // Helper function to create a block
        const createBlock = (type: string, text: string, level?: number) => {
          if (!text.trim()) return null;

          return {
            type,
            props: {
              textColor: "default",
              backgroundColor: "default",
              textAlignment: "left",
              ...(level && { level }),
            },
            content: [
              {
                type: "text",
                text: text.trim(),
                styles: {},
              },
            ],
            children: [],
          };
        };

        // Helper function to check if text is bold
        const isBold = (element: Element): boolean => {
          const style = window.getComputedStyle(element);
          const fontWeight = parseInt(style.fontWeight);
          return (
            fontWeight >= 600 ||
            element.tagName === "STRONG" ||
            element.tagName === "B"
          );
        };

        // Helper function to check if element is standalone (not mixed with normal text)
        const isStandalone = (element: Element): boolean => {
          const parent = element.parentElement;
          if (!parent) return true;

          // Check if parent has only one child (this element)
          if (parent.childNodes.length === 1) return true;

          // Check if all siblings are also bold
          const siblings = Array.from(parent.childNodes).filter(
            (node) => node.nodeType === Node.ELEMENT_NODE
          ) as Element[];

          return siblings.every((sibling) => isBold(sibling));
        };

        // Process child nodes
        for (const node of Array.from(element.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE) {
            currentText += node.textContent || "";
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // If we have accumulated text, create a paragraph block
            if (currentText.trim()) {
              const block = createBlock("paragraph", currentText);
              if (block) blockNoteContent.push(block);
              currentText = "";
            }

            // Process different HTML elements
            if (
              element.tagName === "H1" ||
              element.tagName === "H2" ||
              element.tagName === "H3"
            ) {
              const level = parseInt(element.tagName[1]);
              const block = {
                type: "heading",
                props: {
                  textColor: "default",
                  backgroundColor: "default",
                  textAlignment: "left",
                  level: level,
                },
                content: [
                  {
                    type: "text",
                    text: element.textContent?.trim() || "",
                    styles: {},
                  },
                ],
                children: [],
              };
              blockNoteContent.push(block);
            } else if (element.tagName === "P") {
              // Check if paragraph is entirely bold and standalone
              if (isBold(element) && isStandalone(element)) {
                const block = {
                  type: "heading",
                  props: {
                    textColor: "default",
                    backgroundColor: "default",
                    textAlignment: "left",
                    level: 3,
                  },
                  content: [
                    {
                      type: "text",
                      text: element.textContent?.trim() || "",
                      styles: {},
                    },
                  ],
                  children: [],
                };
                blockNoteContent.push(block);
              } else {
                // Process mixed content
                const mixedContent = await processElement(element);
                blockNoteContent.push(...mixedContent);
              }
            } else if (element.tagName === "UL") {
              // Process each list item as a separate bullet list item
              const listItems = Array.from(element.getElementsByTagName("LI"));
              for (const item of listItems) {
                const block = {
                  type: "bulletListItem",
                  props: {
                    textColor: "default",
                    backgroundColor: "default",
                    textAlignment: "left",
                  },
                  content: [
                    {
                      type: "text",
                      text: item.textContent || "",
                      styles: {},
                    },
                  ],
                  children: [],
                };
                blockNoteContent.push(block);
              }
            } else if (element.tagName === "OL") {
              // Process each list item as a separate numbered list item
              const listItems = Array.from(element.getElementsByTagName("LI"));
              for (const item of listItems) {
                const block = {
                  type: "numberedListItem",
                  props: {
                    textColor: "default",
                    backgroundColor: "default",
                    textAlignment: "left",
                  },
                  content: [
                    {
                      type: "text",
                      text: item.textContent || "",
                      styles: {},
                    },
                  ],
                  children: [],
                };
                blockNoteContent.push(block);
              }
            } else if (element.tagName === "IMG") {
              // Process image element
              const src = element.getAttribute("src");
              if (src && src.startsWith("data:")) {
                try {
                  // Convert base64 to blob
                  const base64Data = src.split(",")[1];
                  const byteCharacters = atob(base64Data);
                  const byteArrays = [];
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteArrays.push(byteCharacters.charCodeAt(i));
                  }
                  const byteArray = new Uint8Array(byteArrays);
                  const blob = new Blob([byteArray], { type: "image/png" });
                  const imageFile = new File([blob], "image.png", {
                    type: "image/png",
                  });

                  // Upload to edgestore
                  const res = await edgestore.publicFiles.upload({
                    file: imageFile,
                    onProgressChange: (progress) => {
                      toast.loading("Загружаем изображение...", {
                        id: toastId,
                      });
                    },
                  });

                  // Create image block with edgestore URL
                  const imageBlock = {
                    type: "image",
                    props: {
                      textColor: "default",
                      backgroundColor: "default",
                      textAlignment: "left",
                      url: res.url,
                      caption: "",
                    },
                    content: [],
                    children: [],
                  };
                  blockNoteContent.push(imageBlock);
                } catch (error) {
                  console.error("Error processing image:", error);
                }
              }
            } else if (isBold(element) && isStandalone(element)) {
              // Convert standalone bold text to heading
              const block = createBlock(
                "heading",
                element.textContent || "",
                3
              );
              if (block) blockNoteContent.push(block);
            } else {
              // Recursively process other elements
              const childBlocks = await processElement(element);
              blockNoteContent.push(...childBlocks);
            }
          }
        }

        // Add any remaining text as a paragraph
        if (currentText.trim()) {
          const block = createBlock("paragraph", currentText);
          if (block) blockNoteContent.push(block);
        }

        return blockNoteContent;
      };

      const blockNoteContent = await processElement(tempDiv);

      // Create a new document
      const newDocument = await create({
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        parentDocument: parentDocumentId,
      });

      // Update the document with the converted content
      await update({
        id: newDocument,
        content: JSON.stringify(blockNoteContent),
      });

      toast.success("Документ успешно импортирован", { id: toastId });

      // Navigate to the new document
      router.push(`/documents/${newDocument}`);
    } catch (error) {
      console.error("Error importing Word document:", error);
      toast.error("Ошибка при импорте документа", { id: toastId });
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
