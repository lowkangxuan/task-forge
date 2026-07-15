import { Checkbox } from "@/components/ui/checkbox";
import type { Todo } from "@/db/schema";
import { TodoLink } from "./todo-link";
import { useMultiSidebar } from "@/components/ui/multisidebar";
import { useState } from "react";
import { updateTodoImmediate } from "@/server/todos";
import { Link, useMatch } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface TodoRowProps {
    todo: Todo,
    path: string,
}

async function handleTaskCompletion(todoId: string, isCompleted: boolean) {
    await updateTodoImmediate(
        {
            data:
            {
                todoId: todoId,
                updates:
                {
                    isCompleted: isCompleted,
                }
            }
        })
}

export function TodoRow({ todo, path }: TodoRowProps) {
    const [checked, setChecked] = useState(todo.isCompleted);
    const { rightSidebar } = useMultiSidebar();
    const match = useMatch({ from: "/_appLayout/projects/$projectId", shouldThrow: false });
    const isActive = match?.search.t === todo.id;

    return (
        <div className={cn("flex items-center gap-2 px-2 py-1 rounded-md hover:bg-secondary", isActive && "bg-accent")}>
            <Checkbox
                checked={checked}
                onCheckedChange={(checked) => {
                    handleTaskCompletion(todo.id, checked === true);
                    setChecked(checked);
                }}

            />
            <Link
                key={todo.id}
                to={path}
                params={{ projectId: todo.projectId }}
                search={{ t: todo.id }}
                onClick={() => rightSidebar.setOpen(true)}
                className="flex-1"
            >
                {todo.name === "" ? "New Task" : todo.name}
            </Link>
        </div>
    )
}