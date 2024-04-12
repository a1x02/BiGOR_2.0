"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button"

const Error = () => {
    return (
        <div className="h-full flex-col flex items-center justify-center space-y-4">
            <Image
                src="/error.svg"
                height="300"
                width="300"
            />
            <h2 className="text-xl font-medium">
                Что-то пошло не так :(
            </h2>
            <Button className="bg-[#006CDC]" asChild>
                <Link href="/documents">
                    Вернуться назад
                </Link>
            </Button>
        </div>
    );
}
 
export default Error;