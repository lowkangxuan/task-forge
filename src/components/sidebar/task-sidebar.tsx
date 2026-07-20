import { useEffect } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useMultiSidebar,
} from "../ui/multisidebar"
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button, buttonVariants } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Field, FieldContent, FieldGroup, FieldLabel } from "../ui/field";
import { CustomInput } from "../ui/custom-input";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { CalendarIcon, ChevronsRight, ClipboardCheck } from "lucide-react";
import { Link, useMatchRoute, useRouter, useSearch } from "@tanstack/react-router";
import { useProjects } from "@/providers/ProjectsProvider";
import { useDebounceTaskBasic } from "@/server/debounce-fn";
import { updateTodoImmediate } from "@/server/todos";
import { format } from "date-fns";
import { getRouter } from "@/router";
import type { ProjectWithTodo } from "@/db/schema";

const formSchema = z.object({
    name: z.string(),
    description: z.string(),
    isCompleted: z.boolean(),
    dueDate: z.union([z.date(), z.undefined()]),
});

function getTodoByProjectId(projects: ProjectWithTodo[], todoId: string) {
    return projects.flatMap((proj) => proj.todos).find((todo) => todo.id === todoId);
}

export function TaskCreationSidebar() {
    const { rightSidebar: { setOpen } } = useMultiSidebar();
    const { localProjects, updateLocalProjects } = useProjects();
    const debounceTaskUpdater = useDebounceTaskBasic();
    const router = useRouter();
    const matchRoute = useMatchRoute();
    const isTaskView = matchRoute({ to: "/projects/$projectId", fuzzy: true }) || matchRoute({ to: "/today", fuzzy: true });
    const todoId = useSearch({
        strict: false,
        select: (search) =>
            search.t,
    });
    const filteredTodo = getTodoByProjectId(localProjects, todoId!);
    const projectId = filteredTodo?.projectId;

    const form = useForm({
        defaultValues: {
            name: filteredTodo?.name ?? "",
            description: filteredTodo?.description ?? "",
            isCompleted: filteredTodo?.isCompleted ?? false,
            dueDate: filteredTodo?.dueDate
                ? new Date(filteredTodo.dueDate)
                : undefined,
        },
        validators: {
            onSubmit: formSchema,
        },

    });

    useEffect(() => {
        if (!filteredTodo) return;

        form.reset({
            name: filteredTodo?.name ?? "",
            description: filteredTodo?.description ?? "",
            isCompleted: filteredTodo?.isCompleted ?? false,
            dueDate: filteredTodo?.dueDate
                ? new Date(filteredTodo.dueDate)
                : undefined,
        });
    }, [filteredTodo?.id]);

    useEffect(() => {
        setOpen(todoId !== undefined && isTaskView !== false);
    }, [todoId]);

    return (
        <Sidebar variant="inset" side="right">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link
                            to="."
                            className={buttonVariants({ variant: "ghost", size: "icon-lg" })}
                        >
                            <ChevronsRight />
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <form
                    id="task-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="px-16 gap-4"
                >
                    <FieldGroup className="gap-0 mb-4">
                        <form.Field
                            name="name"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <CustomInput
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            type="text"
                                            onBlur={field.handleBlur}
                                            onChange={async (e) => {
                                                field.handleChange(e.target.value);
                                                updateLocalProjects((curr) =>
                                                    curr.map((proj) =>
                                                        proj.id === projectId
                                                            ? {
                                                                ...proj,
                                                                todos: proj.todos.map((todo) =>
                                                                    todo.id === todoId
                                                                        ? {
                                                                            ...todo,
                                                                            name: e.target.value,
                                                                        }
                                                                        : todo,
                                                                )
                                                            }
                                                            : proj,
                                                    )
                                                );
                                                await debounceTaskUpdater({ todoId: todoId!, updates: { name: e.target.value } });
                                            }}
                                            aria-invalid={isInvalid}
                                            placeholder="New Task"
                                            autoComplete="off"
                                            variant="ghost"
                                            size="3xl"
                                        />
                                    </Field>
                                )
                            }}
                        />
                        <form.Field
                            name="description"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <CustomInput
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value ?? ""}
                                            type="text"
                                            onBlur={field.handleBlur}
                                            onChange={async (e) => {
                                                field.handleChange(e.target.value)
                                                await debounceTaskUpdater({ todoId: todoId!, updates: { description: e.target.value } });
                                            }}
                                            aria-invalid={isInvalid}
                                            placeholder="Task Description"
                                            autoComplete="off"
                                            variant="ghost"
                                            size="2xl"
                                        />
                                    </Field>
                                )
                            }}
                        />
                    </FieldGroup>
                    <FieldGroup className="gap-2">
                        <form.Field
                            name="dueDate"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid} orientation="responsive" className="items-center! text-sm">
                                        <FieldContent className="flex-none">
                                            <FieldLabel htmlFor={field.name} className="text-sm gap-1 w-24"><CalendarIcon />Due date</FieldLabel>
                                        </FieldContent>
                                        <FieldContent>
                                            <Popover>
                                                <PopoverTrigger render={
                                                    <Button
                                                        variant="ghost"
                                                        id="date-picker-simple"
                                                        className="justify-start min-w-0 text-sm p-0 hover:bg-transparent"
                                                    >
                                                        {field.state.value ? format(field.state.value, "PPP") : <span className="text-foreground">None</span>}
                                                    </Button>
                                                } />
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        id={field.name}
                                                        mode="single"
                                                        selected={field.state.value}
                                                        onSelect={async (date) => {
                                                            field.handleChange(date);
                                                            await updateTodoImmediate({
                                                                data: {
                                                                    todoId: todoId!,
                                                                    updates: {
                                                                        dueDate: date,
                                                                    }
                                                                }
                                                            });
                                                            await router.invalidate();
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FieldContent>
                                    </Field>
                                )
                            }}
                        />

                        <form.Field
                            name="isCompleted"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid} orientation="responsive" className="items-center! text-sm">
                                        <FieldContent className="flex-none">
                                            <FieldLabel htmlFor={field.name} className="text-sm gap-1 w-24"><ClipboardCheck />Status</FieldLabel>
                                        </FieldContent>
                                        <FieldContent>
                                            <Checkbox checked={field.state.value} onCheckedChange={async (e) => {
                                                field.handleChange(e.valueOf());
                                                await updateTodoImmediate({
                                                    data: {
                                                        todoId: todoId!,
                                                        updates: {
                                                            isCompleted: e.valueOf(),
                                                        }
                                                    }
                                                });
                                                await router.invalidate();
                                            }} />
                                        </FieldContent>
                                    </Field>
                                )
                            }}
                        />
                    </FieldGroup>
                </form>
            </SidebarContent>
        </Sidebar>
    )
}
