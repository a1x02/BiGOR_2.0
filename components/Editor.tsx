"use client";

import { useTheme } from "next-themes";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView,
         useCreateBlockNote, 
         FormattingToolbarController,
         BasicTextStyleButton, 
         BlockTypeSelect,  
         CreateLinkButton, 
         FormattingToolbar, 
         ImageCaptionButton,  
         ReplaceImageButton } from "@blocknote/react";
import "@blocknote/react/style.css";

import { useEdgeStore } from "@/lib/edgestore";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

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
    </div>
  );
};

export default Editor;