"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { SingleImageDropzone } from "@/components/single-image-dropzone";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useEdgeStore } from "@/lib/edgestore";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export const CoverImageModal = () => {
  const params = useParams();
  const router = useRouter();
  const coverImage = useCoverImage();
  const { edgestore } = useEdgeStore();
  const update = useMutation(api.documents.update);

  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onClose = () => {
    setFile(undefined);
    setIsSubmitting(false);
    coverImage.onClose();
  };

  const onChange = async (value?: string) => {
    if (value) {
      try {
        const response = await fetch(value);
        const blob = await response.blob();
        const file = new File([blob], "cover-image.jpg", {
          type: "image/jpeg",
        });

        setIsSubmitting(true);
        setFile(file);

        const uploadResponse = await edgestore.publicFiles.upload({
          file,
        });

        await update({
          id: params.documentId as Id<"documents">,
          coverImage: uploadResponse.url,
        });

        onClose();
        router.refresh();
        toast.success("Обложка обновлена!");
      } catch (error) {
        toast.error("Ошибка при загрузке обложки");
      }
    }
  };

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold">
            Обложка документа
          </h2>
        </DialogHeader>
        <div className="h-[200px]">
          <SingleImageDropzone
            disabled={isSubmitting}
            value={file ? URL.createObjectURL(file) : undefined}
            onChange={onChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
