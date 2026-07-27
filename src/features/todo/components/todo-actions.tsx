import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { deleteTodo } from "@/server/functions/todos";
import type { GenericActions } from "@/types/generic-actions";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Copy, Ellipsis, Trash } from "lucide-react";
import { useState } from "react";

type TodoActionsProp = {
    todoId: string;
}

type TodoActions = GenericActions;

const actions = [
    [
        {
            action: "duplicate" as const,
            label: "Duplicate",
            icon: Copy,
        },
        {
            action: "delete" as const,
            label: "Delete",
            icon: Trash,
        },
    ]
]

export function TodoActions({ todoId }: TodoActionsProp) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const router = useRouter();

    async function handleActions(action: TodoActions) {
        switch (action) {
            case "duplicate":
                console.log("duplicate");
                break;

            case "delete":
                navigate({ to: "." });
                await deleteTodo({ data: { todoId: todoId } });
                await router.invalidate();
                break;

            default:
                break;
        }

    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={
                <Button variant="ghost" size="icon-lg">
                    <Ellipsis />
                </Button>
            } />
            <PopoverContent align="end" className="w-56 overflow-hidden rounded-lg p-0">
                <div className="flex flex-col">
                    {actions.map((section, index) => (
                        <div key={index} className="flex flex-col p-2 gap-1 border-b last:border-none">
                            {section.map((item, index) => (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    className="justify-start text-sm font-normal gap-2"
                                    onClick={() => {
                                        handleActions(item.action);
                                        setOpen(false);
                                    }}
                                >
                                    <item.icon /> <span>{item.label}</span>
                                </Button>
                            ))}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}