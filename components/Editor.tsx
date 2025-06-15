"use client";

import { useTheme } from "next-themes";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import {
  BlockNoteView,
  useCreateBlockNote,
  FormattingToolbarController,
  BasicTextStyleButton,
  BlockTypeSelect,
  CreateLinkButton,
  FormattingToolbar,
  ImageCaptionButton,
  ReplaceImageButton,
} from "@blocknote/react";
import "@blocknote/react/style.css";

import { useEdgeStore } from "@/lib/edgestore";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { FormulaBlock } from "./FormulaBlock";
import { useDictionary } from "@/hooks/use-dictionary";
import { useState, useEffect } from "react";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
  documentId?: Id<"documents">;
  formulas?: Array<{
    id: string;
    formula: string;
    position: number;
  }>;
  preview?: boolean;
  onHighlightTerms?: () => void;
}

const Editor = ({
  onChange,
  initialContent,
  editable,
  documentId,
  formulas = [],
  preview,
  onHighlightTerms,
}: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const addFormula = useMutation(api.documents.addFormula);
  const removeFormula = useMutation(api.documents.removeFormula);
  const { words } = useDictionary();
  const [shouldHighlightTerms, setShouldHighlightTerms] = useState(false);

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({
      file,
    });

    return response.url;
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    uploadFile: handleUpload,
  });

  const handleAddFormula = () => {
    if (!documentId) return;
    const position = formulas.length;
    addFormula({
      documentId,
      formula: "",
      position,
    });
  };

  const handleRemoveFormula = (formulaId: string) => {
    if (!documentId) return;
    removeFormula({
      documentId,
      formulaId,
    });
  };

  const handleChange = () => {
    const content = editor.document;
    onChange(JSON.stringify(content, null, 2));
  };

  const handleHighlightTerms = () => {
    setShouldHighlightTerms(!shouldHighlightTerms);

    const blocks = editor.document;
    console.log("Current blocks:", blocks);
    console.log("Dictionary words:", words);

    blocks.forEach((block) => {
      if (block.content && Array.isArray(block.content)) {
        const content = block.content[0];
        if (content && content.type === "text") {
          const text = content.text;
          console.log("Processing text:", text);
          const styles = { ...content.styles };

          if (!shouldHighlightTerms) {
            // Apply highlighting
            words.forEach((word) => {
              const regex = new RegExp(`\\b${word.word}\\b`, "gi");
              if (regex.test(text)) {
                console.log("Found match for word:", word.word);
                styles.underline = true;
                styles.textColor = "blue";
              }
            });
          } else {
            // Remove highlighting
            styles.underline = false;
            styles.textColor = undefined;
          }

          console.log("Applying styles:", styles);
          editor.updateBlock(block, {
            content: [
              {
                type: "text",
                text,
                styles,
              },
            ],
          });
        }
      }
    });

    handleChange();
  };

  useEffect(() => {
    if (onHighlightTerms) {
      onHighlightTerms();
    }
  }, [shouldHighlightTerms, onHighlightTerms]);

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        formattingToolbar={false}
        onChange={handleChange}
        editable={editable}
      >
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect />
              <ImageCaptionButton />
              <ReplaceImageButton />
              <BasicTextStyleButton basicTextStyle="bold" />
              <BasicTextStyleButton basicTextStyle="italic" />
              <BasicTextStyleButton basicTextStyle="underline" />
              <BasicTextStyleButton basicTextStyle="strike" />
              <BasicTextStyleButton basicTextStyle="code" />
              <CreateLinkButton />
            </FormattingToolbar>
          )}
        />
      </BlockNoteView>

      {documentId &&
        formulas.map((formula) => (
          <FormulaBlock
            key={formula.id}
            documentId={documentId}
            formulaId={formula.id}
            initialFormula={formula.formula}
            onRemove={() => handleRemoveFormula(formula.id)}
            preview={preview}
          />
        ))}
    </div>
  );
};

export default Editor;
