"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { IconPicker } from "./IconPicker";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  Smile,
  X,
  FileText,
  SquareFunction,
  BookOpen,
} from "lucide-react";
import { ElementRef, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import TextareaAutosize from "react-textarea-autosize";
import { useCoverImage } from "@/hooks/use-cover-image";
import { WordImportButton } from "./WordImportButton";

interface ToolbarProps {
  initialData: Doc<"documents">;
  preview?: boolean;
  onHighlightTerms?: () => void;
}

export const Toolbar = ({
  initialData,
  preview,
  onHighlightTerms,
}: ToolbarProps) => {
  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title);

  const update = useMutation(api.documents.update);
  const removeIcon = useMutation(api.documents.removeIcon);
  const addFormula = useMutation(api.documents.addFormula);

  const coverImage = useCoverImage();

  const enableInput = () => {
    if (preview) return;

    setIsEditing(true);
    setTimeout(() => {
      setValue(initialData.title);
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onInput = (value: string) => {
    setValue(value);
    update({
      id: initialData._id,
      title: value || "Без имени",
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  };

  const onIconSelect = (icon: string) => {
    update({
      id: initialData._id,
      icon,
    });
  };

  const onIconRemove = () => {
    removeIcon({
      id: initialData._id,
    });
  };

  const onAddFormula = () => {
    const position = initialData.formulas?.length || 0;
    addFormula({
      documentId: initialData._id,
      formula: "",
      position,
    });
  };

  return (
    <div className="pl-[54px] group relative">
      {!!initialData.icon && !preview && (
        <div className="flex items-center gap-x-2 group/icon pt-6">
          <IconPicker asChild onChange={onIconSelect}>
            <Button
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
            >
              <p className="font-normal">{initialData.icon}</p>
            </Button>
          </IconPicker>
          <Button
            onClick={onIconRemove}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!!initialData.icon && preview && (
        <p className="text-6xl pt-6">{initialData.icon}</p>
      )}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
        {!initialData.icon && !preview && (
          <IconPicker asChild onChange={onIconSelect}>
            <Button
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
            >
              <Smile className="h-4 w-4 mr-2" />
              Добавить иконку
            </Button>
          </IconPicker>
        )}
        {!initialData.coverImage && !preview && (
          <Button
            onClick={coverImage.onOpen}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Добавить обложку
          </Button>
        )}
        {!preview && (
          <>
            <WordImportButton parentDocumentId={initialData._id} />
            <Button
              onClick={onAddFormula}
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
            >
              <SquareFunction className="h-4 w-4 mr-2" />
              Добавить формулу
            </Button>
            <Button
              onClick={onHighlightTerms}
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Найти термины
            </Button>
          </>
        )}
      </div>
      {isEditing && !preview ? (
        <TextareaAutosize
          ref={inputRef}
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={value}
          onChange={(e) => onInput(e.target.value)}
          className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none"
        />
      ) : (
        <div
          onClick={enableInput}
          className="pb-[11.5px] text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF]"
        >
          {initialData.title}
        </div>
      )}
    </div>
  );
};
