"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { X } from "lucide-react";
import { FormulaKeyboard } from "./FormulaKeyboard";
import { FormulaRenderer } from "./FormulaRenderer";

interface FormulaBlockProps {
  documentId: Id<"documents">;
  formulaId: string;
  initialFormula: string;
  onRemove: () => void;
  preview?: boolean;
}

export const FormulaBlock = ({
  documentId,
  formulaId,
  initialFormula,
  onRemove,
  preview,
}: FormulaBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formula, setFormula] = useState(initialFormula);

  const updateFormula = useMutation(api.documents.updateFormula);

  const handleSave = () => {
    updateFormula({
      documentId,
      formulaId,
      formula,
    });
    setIsOpen(false);
  };

  const handleKeyPress = (key: string) => {
    const input = document.querySelector("input");
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = formula.substring(0, start) + key + formula.substring(end);
    setFormula(newValue);

    // Устанавливаем курсор после вставленного символа
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + key.length, start + key.length);
    }, 0);
  };

  return (
    <div className="relative w-full p-4 border rounded-lg group">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">Формула</div>
        {!preview && (
          <div className="flex items-center gap-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="opacity-0 group-hover:opacity-100"
            >
              Редактировать
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="p-2 bg-muted rounded">
        {formula ? <FormulaRenderer formula={formula} /> : "Нет формулы"}
      </div>

      {!preview && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Редактор формул</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="Введите формулу"
              />
              <FormulaKeyboard onKeyPress={handleKeyPress} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSave}>Сохранить</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
