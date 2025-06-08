import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface ContentItem {
  type: string;
  text: string;
  styles: Record<string, any>;
}

interface Block {
  content: ContentItem[];
  [key: string]: any;
}

export const useDictionary = () => {
  const words = useQuery(api.dictionary.getWords) || [];
  const addWord = useMutation(api.dictionary.addWord);
  const updateWord = useMutation(api.dictionary.updateWord);
  const deleteWord = useMutation(api.dictionary.deleteWord);

  const processBlock = (block: Block, words: any[]) => {
    if (!block.content || !words.length) return block;

    // Проверяем, что content является массивом
    if (!Array.isArray(block.content)) return block;

    const updatedContent = block.content.map((contentItem: ContentItem) => {
      if (contentItem.type === "text") {
        let text = contentItem.text;
        let styles = { ...contentItem.styles };

        words.forEach((word) => {
          const regex = new RegExp(`\\b${word.word}\\b`, "gi");
          if (regex.test(text)) {
            text = text.replace(regex, (match: string) => {
              styles = {
                ...styles,
                backgroundColor: "yellow",
                textDecoration: "underline",
                textDecorationColor: "blue",
                textDecorationStyle: "dotted",
              };
              return match;
            });
          }
        });

        return {
          ...contentItem,
          text,
          styles,
        };
      }
      return contentItem;
    });

    return {
      ...block,
      content: updatedContent,
    };
  };

  const onAddWord = async (word: string) => {
    try {
      await addWord({ word });
      toast.success("Термин добавлен");
    } catch (error) {
      toast.error("Ошибка при добавлении термина");
    }
  };

  const onUpdateWord = async (id: Id<"dictionary">, word: string) => {
    try {
      await updateWord({ id, word });
      toast.success("Термин обновлен");
    } catch (error) {
      toast.error("Ошибка при обновлении термина");
    }
  };

  const onDeleteWord = async (id: Id<"dictionary">) => {
    try {
      await deleteWord({ id });
      toast.success("Термин удален");
    } catch (error) {
      toast.error("Ошибка при удалении термина");
    }
  };

  return {
    words,
    onAddWord,
    onUpdateWord,
    onDeleteWord,
    processBlock,
  };
};
