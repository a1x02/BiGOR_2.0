"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader
} from "@/components/ui/dialog";

import { useSettings } from "@/hooks/use-settings";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";
import { useEffect, useState } from "react";

export const SettingsModal = () => {
    const settings = useSettings();
    const toggle = useSettings((store) => store.toggle);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const down = (event: KeyboardEvent) => {
            if ((event.key === "o" || event.key === "O" || event.key === "щ" || event.key === "Щ") && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggle();
            }
        }

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [toggle]);

    if (!isMounted) {
        return null;
    }
    

    return (
        <Dialog
            open={settings.isOpen}
            onOpenChange={settings.onClose}
        >
            <DialogContent>
                <DialogHeader
                    className="border-b pb-3"
                >
                    <h2 className="text-lg font-medium">
                        Настройки
                    </h2>
                </DialogHeader>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-y-1">
                        <Label>
                            Внешний вид
                        </Label>
                        <span className="text-[0.8rem] text-muted-foreground">
                            Кастомизируйте внешний вид БиГОР на Вашем устройстве
                        </span>
                    </div>
                    <ModeToggle />
                </div>
            </DialogContent>
        </Dialog>
    )
}