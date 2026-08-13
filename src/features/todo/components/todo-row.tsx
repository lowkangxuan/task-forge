import { Checkbox } from "@/components/ui/checkbox";
import type { Todo } from "@/db/schema";
import React, { useEffect, useState, type ReactNode } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { CalendarX, Flag } from "lucide-react";
import { format } from "date-fns";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { TODO_ACTIONS, type TodoActions } from "../todo-actions";
import { useDeleteTodo, useDuplicateTodo, useUpdateTodoCompleted } from "../api/todo-mutations";

interface TodoRowProps {
    todo: Todo,
    path?: string,
}


function TodoSubDetail({ className, children }: { children: ReactNode } & React.HTMLAttributes<"span">) {
    return (
        <span className={cn("flex gap-1 items-center px-2 border-r first:pl-0 last:border-0 last:pr-0", className)}>
            {children}
        </span>
    )
}

export function TodoRow({ todo, path }: TodoRowProps) {
    const deleteTodoMutation = useDeleteTodo();
    const duplicateTodoMutation = useDuplicateTodo();
    const updateCompletedMutation = useUpdateTodoCompleted();
    const [checked, setChecked] = useState(todo.isCompleted);
    const search = useSearch({ strict: false });
    const isActive = search?.todo === todo.id;

    useEffect(() => {
        setChecked(todo.isCompleted);
    }, [todo.isCompleted]);

    async function handleAction(action: TodoActions) {
        switch (action) {
            case "duplicate": {
                const { projectId, name, description, priority, isCompleted, dueDate } = todo;
                duplicateTodoMutation.mutate({
                    projectId,
                    name,
                    description,
                    priority,
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
                />
            }>
                <Checkbox
                    checked={checked}
                    onCheckedChange={async (checked) => {
                        setChecked(checked);
                        updateCompletedMutation.mutate({
                            projectId: todo.projectId,
                            todoId: todo.id,
                            isCompleted: checked,
                        })
                    }}

                />
                <Link
                    key={todo.id}
                    to={path ?? `.`}
                    params={{ projectId: todo.projectId }}
                    search={{ todo: todo.id }}
                    className="flex flex-col flex-1"
                >
                    <span className="text-sm">{todo.name === "" ? "New Task" : todo.name}</span>
                    <div className="flex text-xs">
                        {todo.dueDate && <TodoSubDetail><CalendarX size={16} />{format(todo.dueDate, "PPP")}</TodoSubDetail>}
                        {todo.priority !== "none" && <TodoSubDetail className="capitalize"><Flag size={16} />{todo.priority}</TodoSubDetail>}
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