import { Checkbox } from "@/components/ui/checkbox";
import type { Todo } from "@/db/schema";
import { useEffect, useState } from "react";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { CalendarX } from "lucide-react";
import { format } from "date-fns";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { TODO_ACTIONS, type TodoActions } from "../todo-actions";
import { useDeleteTodo, useDuplicateTodo } from "../api/todo-mutations";

interface TodoRowProps {
    todo: Todo,
    path?: string,
}

async function handleTaskCompletion(todoId: string, isCompleted: boolean) {
    await updateTodo({
        data: {
            todoId: todoId,
            updates: {
                isCompleted: isCompleted,
            }
        }
    })
}

export function TodoRow({ todo, path }: TodoRowProps) {
    const deleteTodoMutation = useDeleteTodo();
    const duplicateTodoMutation = useDuplicateTodo();
    const [checked, setChecked] = useState(todo.isCompleted);
    const search = useSearch({ strict: false });
    const isActive = search?.t === todo.id;

    useEffect(() => {
        setChecked(todo.isCompleted);
    }, [todo.isCompleted]);

    async function handleAction(action: TodoActions) {
        switch (action) {
            case "duplicate": {
                const { projectId, name, description, isCompleted, dueDate } = todo;
                duplicateTodoMutation.mutate({
                    projectId,
                    name,
                    description,
                    isCompleted,
                    dueDate
                });
                break;
            }

            case "delete": {
                deleteTodoMutation.mutate(todo.id);
                break;
            }
        }
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger render={
                <div
                    className={cn("flex items-center gap-2 px-2 py-1 rounded-md hover:bg-secondary", isActive && "bg-accent")}
                // onClick={() => setDialogOpen(true)}
                />
            }>
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
                    <span className="text-sm">{todo.name === "" ? "New Task" : todo.name}</span>
                    <div className="flex divide-x text-xs">
                        {todo.dueDate && <span className="flex gap-1 items-center"><CalendarX size={16} />{format(todo.dueDate, "PPP")}</span>}
                    </div>
                </Link>
            </ContextMenuTrigger>
            <ContextMenuContent>
                {TODO_ACTIONS.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                        <ContextMenuGroup>
                            {section.map((item) => (
                                <ContextMenuItem
                                    key={item.action}
                                    onClick={() => handleAction(item.action)}
                                >
                                    <item.icon />
                                    {item.label}
                                </ContextMenuItem>
                            ))}
                        </ContextMenuGroup>
                    </div>
                ))}
            </ContextMenuContent>
        </ContextMenu>
    )
}