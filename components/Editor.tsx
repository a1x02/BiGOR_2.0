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
}

const Editor = ({
  onChange,
  initialContent,
  editable,
  documentId,
  formulas = [],
  preview,
}: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const addFormula = useMutation(api.documents.addFormula);
  const removeFormula = useMutation(api.documents.removeFormula);

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

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        formattingToolbar={false}
        onChange={() => {
          onChange(JSON.stringify(editor.document, null, 2));
        }}
        editable={editable}
      >
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect key={"blockTypeSelect"} />

              {/* Extra button to toggle blue text & background */}

              <ImageCaptionButton key={"imageCaptionButton"} />
              <ReplaceImageButton key={"replaceImageButton"} />

              <BasicTextStyleButton
                basicTextStyle={"bold"}
                key={"boldStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"italic"}
                key={"italicStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"underline"}
                key={"underlineStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"strike"}
                key={"strikeStyleButton"}
              />
              {/* Extra button to toggle code styles */}
              <BasicTextStyleButton
                key={"codeStyleButton"}
                basicTextStyle={"code"}
              />

              <CreateLinkButton key={"createLinkButton"} />
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
