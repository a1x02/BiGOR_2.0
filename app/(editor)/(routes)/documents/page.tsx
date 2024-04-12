"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

const DocumentsPage = () => {
const { user } = useUser();
const create = useMutation(api.documents.create);
const router = useRouter();

const onCreate = () => {
    const promise = create({ title: "Без имени" })
    .then((documentId) => router.push(`/documents/${documentId}`));

    toast.promise(promise, {
        loading: "Создаем новый документ...",
        success: "Документ создан!",
        error: "Не удалось создать документ."
    })
}

    return ( 
        <div className="h-full flex flex-col items-center justify-center space-y-4">
            <Image 
                src="/empty.png"
                alt=""
                height="300"
                width="300"
                className="dark:hidden"
            />
            <Image 
                src="/empty-dark.png"
                alt=""
                height="300"
                width="300"
                className="hidden dark:block"
            />
            <h2 className="ml-auto mr-auto text-lg font-medium w-3/4 text-center">
                {user?.username}, Добро пожаловать в редактор документов БиГОР 2.0
            </h2>
            <Button onClick={onCreate} className="bg-[#006CDC]" >
                <PlusCircle className="h-4 w-4 mr-2" />
                Добавить документ
            </Button>
        </div>
     );
}
 
export default DocumentsPage;