import { Checkbox } from "@/components/ui/checkbox";
import type { Todo } from "@/db/schema";
import { useEffect, useState } from "react";
import { updateTodoImmediate } from "@/server/todos";
import { Link, useMatchRoute, useSearch } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { CalendarX } from "lucide-react";
import { format } from "date-fns";

interface TodoRowProps {
    todo: Todo,
    path?: string,
}

async function handleTaskCompletion(todoId: string, isCompleted: boolean) {
    await updateTodoImmediate({
        data: {
            todoId: todoId,
            updates: {
                isCompleted: isCompleted,
            }
        }
    })
}

export function TodoRow({ todo, path }: TodoRowProps) {
    const [checked, setChecked] = useState(todo.isCompleted);
    const matchRoute = useMatchRoute();
    const search = useSearch({ strict: false });
    const isActive = search?.t === todo.id;
    const isProjectView = matchRoute({ to: "/projects/$projectId" });

    useEffect(() => {
        setChecked(todo.isCompleted);
    }, [todo.isCompleted]);

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
                to={path ?? `.`}
                params={{ projectId: todo.projectId }}
                search={{ t: todo.id }}
                className="flex flex-col flex-1"
            >
                <span>{todo.name === "" ? "New Task" : todo.name}</span>
                <div className="flex divide-x">
                    {todo.dueDate && <span className="flex gap-1 text-sm items-center px-2"><CalendarX size={20} />{format(todo.dueDate, "PPP")}</span>}
                    {/* {!isProjectView && <span className="px-2">{todo.projectId}</span>} */}
                </div>
            </Link>
        </div>
    )
}