import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { deleteTodo } from "@/server/functions/todos";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import { TODO_ACTIONS, type TodoActions } from "../todo-actions";

type TodoActionsProp = {
    todoId: string;
}

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
                    {TODO_ACTIONS.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="flex flex-col p-2 gap-1 border-b last:border-none">
                            {section.map((item) => (
                                <Button
                                    key={item.action}
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