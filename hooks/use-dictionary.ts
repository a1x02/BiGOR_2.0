import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DefaultBlockSchema, DefaultInlineContentSchema, PartialBlock } from "@blocknote/core";

export const useDictionary = () => {
    const words = useQuery(api.dictionary.getWords) || [];

    const highlightTerms = (block: PartialBlock<DefaultBlockSchema, DefaultInlineContentSchema>) => {
        if (!block.content || !words.length) return block;

        const updatedContent = block.content.map(contentItem => {
            if (contentItem.type === "text") {
                let text = contentItem.text;
                let styles = { ...contentItem.styles };

                words.forEach(({ word }) => {
                    const regex = new RegExp(`\\b${word}\\b`, 'gi');
                    if (regex.test(text)) {
                        styles = {
                            ...styles,
                            backgroundColor: "yellow"
                        };
                    }
                });

                return {
                    ...contentItem,
                    styles
                };
            }
            return contentItem;
        });

        return {
            ...block,
            content: updatedContent
        };
    };

    return {
        words,
        highlightTerms
    };
}; 