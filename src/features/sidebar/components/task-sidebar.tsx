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
import { Link, useMatchRoute, useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { useProjects } from "@/providers/ProjectsProvider";
import { useDebounceTaskBasic } from "@/server/debounce-fn";
import { updateTodo } from "@/server/functions/todos";
import { format } from "date-fns";
import type { ProjectWithTodo } from "@/db/schema";
import { TodoActions } from "@/features/todo/components/todo-sidebar-actions";
import { filterCheck } from "@/features/todo/filters";

const formSchema = z.object({
    name: z.string(),
    description: z.string(),
    isCompleted: z.boolean(),
    dueDate: z.union([z.date(), z.undefined()]),
});

function getTodoByProjectId(projects: ProjectWithTodo[], todoId: string) {
    return projects.flatMap((proj) => proj.todos).find((todo) => todo.id === todoId);
}

export function TaskSidebar() {
    const { rightSidebar: { setOpen } } = useMultiSidebar();
    const { localProjects, updateLocalProjects } = useProjects();
    const debounceTaskUpdater = useDebounceTaskBasic();
    const router = useRouter();
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
    const selectedTodo = (() => {
        if (!todoId) return undefined;
        const todo = getTodoByProjectId(localProjects, todoId);
        if (!todo) return undefined;

        if (isTodayRoute) {
            const belongsToToday = todo.dueDate ? filterCheck(todo.dueDate, "today") : false;

            if (!belongsToToday) {
                return undefined;
            }
        }

        if (isUpcomingRoute) {
            const belongsToUpcoming = todo.dueDate ? filterCheck(todo.dueDate, "today") || filterCheck(todo.dueDate, "tomorrow") || filterCheck(todo.dueDate, "this_week") || filterCheck(todo.dueDate, "next_week") || filterCheck(todo.dueDate, "this_month") : false;

            if (!belongsToUpcoming) {
                return undefined;
            }
        }

        return todo;
    })();

    // const filteredTodo = getTodoByProjectId(localProjects, todoId!);
    const projectId = selectedTodo?.projectId;

    const form = useForm({
        defaultValues: {
            name: selectedTodo?.name ?? "",
            description: selectedTodo?.description ?? "",
            isCompleted: selectedTodo?.isCompleted ?? false,
            dueDate: selectedTodo?.dueDate
                ? new Date(selectedTodo.dueDate)
                : undefined,
        },
        validators: {
            onSubmit: formSchema,
        },

    });

    useEffect(() => {
        if (!selectedTodo) return;

        form.reset({
            name: selectedTodo?.name ?? "",
            description: selectedTodo?.description ?? "",
            isCompleted: selectedTodo?.isCompleted ?? false,
            dueDate: selectedTodo?.dueDate
                ? new Date(selectedTodo.dueDate)
                : undefined,
        });
    }, [selectedTodo?.id]);


    useEffect(() => {
        const isSupportedRoute = isProjectRoute || isTodayRoute || isUpcomingRoute;
        const hasValidTask = Boolean(todoId && selectedTodo);

        setOpen(isSupportedRoute && hasValidTask);

        if (todoId && isSupportedRoute && !selectedTodo) {
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
        selectedTodo,
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
                            <TodoActions todo={selectedTodo!} />
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
                                                            await updateTodo({
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
                                            <FieldLabel htmlFor={field.name} className="text-sm gap-1 w-32"><ClipboardCheck />Status</FieldLabel>
                                        </FieldContent>
                                        <FieldContent>
                                            <Checkbox checked={field.state.value} onCheckedChange={async (e) => {
                                                field.handleChange(e.valueOf());
                                                await updateTodo({
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
