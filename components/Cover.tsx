"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImageIcon, ImageMinus } from "lucide-react";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useEdgeStore } from "@/lib/edgestore";
import { Skeleton } from "@/components/ui/skeleton";

interface CoverProps {
    url?: string;
    preview?: boolean;
}

export const Cover = ({
    url,
    preview
}: CoverProps) => {
    const { edgestore } = useEdgeStore();
    const params = useParams();
    const coverImage = useCoverImage();
    const removeCoverImage = useMutation(api.documents.removeCoverImage);

    const onRemove = async () => {
        if (url) {
            await edgestore.publicFiles.delete({
                url: url
            })
        }
        
        removeCoverImage({
            id: params.documentId as Id<"documents">
        })
    }

    return (
        <div className={cn(
            "relative w-full h-[35vh] group",
            !url && "h-[12vh]",
            url && "bg-muted"
        )}>
            {!!url && (
                <Image 
                    src={url}
                    fill
                    alt="Обложка"
                    className="object-cover"
                />
            )}
            {url && !preview && (
                <div
                    className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2"
                >
                    <Button
                        onClick={() => coverImage.onReplace(url)}
                        className="text-muted-foreground text-xs"
                        variant="outline"
                        size="sm"
                    >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Изменить обложку
                    </Button>
                    <Button
                        onClick={onRemove}
                        className="text-muted-foreground text-xs"
                        variant="outline"
                        size="sm"
                    >
                        <ImageMinus className="h-4 w-4 mr-2" />
                        Удалить обложку
                    </Button>
                </div>
            )}
        </div>
    )
}

Cover.Skeleton = function CoverSkeleton() {
    return (
        <Skeleton className="w-full h-[12vh]" />
    )
}