"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, Check, X } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface DictionaryWord {
    _id: Id<"dictionary">;
    word: string;
}

export const DictionaryBox = () => {
    const [newWord, setNewWord] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    const words = useQuery(api.dictionary.getWords) || [];
    const addWord = useMutation(api.dictionary.addWord);
    const updateWord = useMutation(api.dictionary.updateWord);
    const deleteWord = useMutation(api.dictionary.deleteWord);

    const handleAddWord = async () => {
        if (newWord.trim()) {
            try {
                await addWord({ word: newWord.trim() });
                setNewWord("");
                toast.success("Термин добавлен");
            } catch (error) {
                toast.error("Не удалось добавить термин");
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleAddWord();
        }
    };

    const handleDelete = async (word: DictionaryWord) => {
        try {
            await deleteWord({ id: word._id });
            toast.success("Термин удален");
        } catch (error) {
            toast.error("Не удалось удалить термин");
        }
    };

    const handleEdit = (word: DictionaryWord) => {
        setEditingIndex(words.findIndex(w => w._id === word._id));
        setEditValue(word.word);
    };

    const handleSaveEdit = async (word: DictionaryWord) => {
        if (editValue.trim()) {
            try {
                await updateWord({ id: word._id, word: editValue.trim() });
                setEditingIndex(null);
                setEditValue("");
                toast.success("Термин обновлен");
            } catch (error) {
                toast.error("Не удалось обновить термин");
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditValue("");
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex gap-x-2 mb-4">
                <Input
                    placeholder="Введите термин"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                    size="sm"
                    onClick={handleAddWord}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-scroll pr-2 scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
                {words.map((word) => (
                    <div
                        key={word._id}
                        className="text-sm p-2 bg-secondary rounded-md flex items-center justify-between group"
                    >
                        {editingIndex === words.findIndex(w => w._id === word._id) ? (
                            <div className="flex items-center gap-x-2 flex-1">
                                <Input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="h-7 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveEdit(word);
                                        if (e.key === "Escape") handleCancelEdit();
                                    }}
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleSaveEdit(word)}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancelEdit}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <span>{word.word}</span>
                                <div className="flex items-center gap-x-1 opacity-0 group-hover:opacity-100 transition">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEdit(word)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(word)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}; 