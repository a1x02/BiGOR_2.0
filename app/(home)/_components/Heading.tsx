"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { Spinner } from "@/components/spinner";
import Link from "next/link";


export const Heading = () => {
    const { isAuthenticated, isLoading } = useConvexAuth();

    return ( 
        <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
                Добро пожаловать <br/> на <span className="underline">БиГОР 2.0</span>!
            </h1>
            <h3 className="text-base sm:text-xl md:text-2xl font-medium">
                BiGOR 2.0 - это новая платформа с дружелюбным интерфейсом, для редактирования и оперирования учебными программами.
            </h3>
            {isLoading && (
                <div className="w-full flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            )}
                <Button className="bg-[#006CDC] dark:bg-[#006CDC]" asChild>
                    {/* TODO: ссылка на страницу для гостей*/}
                    <Link href="/documents">
                    На BiGOR 2.0 <ArrowRight className="h-4 w-4 ml-2"/>
                    </Link>
                </Button>
            
        </div>
     );
}
 
export default Heading;