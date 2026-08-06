import { useEffect } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useMultiSidebar,
} from "@/components/ui/multisidebar"
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { CustomInput } from "@/components/ui/custom-input";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { CalendarIcon, ChevronsRight, ClipboardCheck } from "lucide-react";
import { Link, useMatchRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useDebounceTaskBasic } from "@/server/debounce-fn";
import { updateTodo } from "@/server/functions/todos";
import { format } from "date-fns";
import type { ProjectWithTodo } from "@/db/schema";
import { TodoActions } from "@/features/todo/components/todo-sidebar-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "@/features/project/api/project-queries";
import { todoQueryOptions } from "@/features/todo/api/todo-queries";

const formSchema = z.object({
    name: z.string(),
    description: z.string(),
    isCompleted: z.boolean(),
    dueDate: z.union([z.date(), z.undefined()]),
});

export function TaskSidebar() {
    const { rightSidebar: { setOpen } } = useMultiSidebar();
    const debounceTaskUpdater = useDebounceTaskBasic();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const matchRoute = useMatchRoute();
    const isProjectRoute = matchRoute({ to: "/projects/$projectId", fuzzy: false, }) !== false;
    const isTodayRoute = matchRoute({ to: "/today", fuzzy: false, }) !== false;
    const isUpcomingRoute = matchRoute({ to: "/upcoming", fuzzy: false, }) !== false;

    const todoId = useSearch({
        strict: false,
        select: (search) =>
            search.t,
    });
    const { data: todo } = useQuery(todoQueryOptions(queryClient, todoId));

    const form = useForm({
        defaultValues: {
            name: todo?.name ?? "",
            description: todo?.description ?? "",
            isCompleted: todo?.isCompleted ?? false,
            dueDate: todo?.dueDate
                ? new Date(todo.dueDate)
                : undefined,
        },
        validators: {
            onSubmit: formSchema,
        },

    });

    useEffect(() => {
        if (!todo) return;

        form.reset({
            name: todo?.name ?? "",
            description: todo?.description ?? "",
            isCompleted: todo?.isCompleted ?? false,
            dueDate: todo?.dueDate
                ? new Date(todo.dueDate)
                : undefined,
        });
    }, [todo?.id]);


    useEffect(() => {
        const isSupportedRoute = isProjectRoute || isTodayRoute || isUpcomingRoute;
        const hasValidTask = Boolean(todoId && todo);

        setOpen(isSupportedRoute && hasValidTask);

        if (todoId && isSupportedRoute && !todo) {
            void navigate({
                to: ".",
                search: (previous) => ({
                    ...previous,
                    t: undefined,
                }),
                replace: true,
            });
        }
    }, [
        todoId,
        todo,
        isProjectRoute,
        isTodayRoute,
        isUpcomingRoute,
    ]);

    return (
        <Sidebar variant="inset" side="right">
            <SidebarHeader>
                <SidebarGroup className="flex-row">
                    <SidebarMenu className="">
                        <SidebarMenuItem>
                            <Link
                                to="."
                                search={(prev) => ({
                                    ...prev,
                                    t: undefined,
                                })}
                                replace={true}
                                className={buttonVariants({ variant: "ghost", size: "icon-lg" })}
                            >
                                <ChevronsRight />
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <SidebarMenu className="w-fit">
                        <SidebarMenuItem>
                            <TodoActions todo={todo!} />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
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
                                            onChange={(e) => {
                                                field.handleChange(e.target.value);

                                                queryClient.setQueryData<ProjectWithTodo>(
                                                    projectKeys.detail(todo!.projectId),
                                                    (project) => {
                                                        if (!project) return project;
                                                        return {
                                                            ...project,
                                                            todos: project.todos.map((todo) =>
                                                                todo.id === todoId
                                                                    ? { ...todo, name: e.target.value }
                                                                    : todo
                                                            ),
                                                        };
                                                    }
                                                );

                                                debounceTaskUpdater({ todoId: todoId!, updates: { name: e.target.value } });
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
                                            <FieldLabel htmlFor={field.name} className="text-sm gap-1 w-32"><CalendarIcon />Due date</FieldLabel>
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

                                                            queryClient.setQueryData<ProjectWithTodo>(
                                                                projectKeys.detail(todo!.projectId),
                                                                (project) => {
                                                                    if (!project) return project;
                                                                    return {
                                                                        ...project,
                                                                        todos: project.todos.map((todo) =>
                                                                            todo.id === todoId
                                                                                ? { ...todo, dueDate: date ?? null }
                                                                                : todo
                                                                        ),
                                                                    };
                                                                }
                                                            );

                                                            await updateTodo({
                                                                data: {
                                                                    todoId: todoId!,
                                                                    updates: {
                                                                        dueDate: date,
                                                                    }
                                                                }
                                                            });
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
                                            <FieldLabel htmlFor={field.name} className="text-sm gap-1 w-32"><ClipboardCheck />Status</FieldLabel>
                                        </FieldContent>
                                        <FieldContent>
                                            <Checkbox
                                                checked={field.state.value}
                                                onCheckedChange={async (e) => {
                                                    field.handleChange(e.valueOf());

                                                    queryClient.setQueryData<ProjectWithTodo>(
                                                        projectKeys.detail(todo!.projectId),
                                                        (project) => {
                                                            if (!project) return project;
                                                            return {
                                                                ...project,
                                                                todos: project.todos.map((todo) =>
                                                                    todo.id === todoId
                                                                        ? { ...todo, isCompleted: e.valueOf() }
                                                                        : todo
                                                                ),
                                                            };
                                                        }
                                                    );

                                                    await updateTodo({
                                                        data: {
                                                            todoId: todoId!,
                                                            updates: {
                                                                isCompleted: e.valueOf(),
                                                            }
                                                        }
                                                    });
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
