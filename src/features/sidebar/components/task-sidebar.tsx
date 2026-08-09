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
import { CalendarIcon, ChevronsRight, ClipboardCheck, Flag } from "lucide-react";
import { Link, useMatchRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useDebounceTaskBasic } from "@/server/debounce-fn";
import { format } from "date-fns";
import { priorityEnum, type Priority, type ProjectWithTodo, type Todo } from "@/db/schema";
import { TodoActions } from "@/features/todo/components/todo-sidebar-actions";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "@/features/project/api/project-queries";
import { todoKeys, todoQueryOptions } from "@/features/todo/api/todo-queries";
import { useUpdateTodoCompleted, useUpdateTodoDate, useUpdateTodoPriority } from "@/features/todo/api/todo-mutations";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type optimisticInput = {
    queryClient: QueryClient;
    projectId: string;
    todoId: string;
}

const priorities = [
    { label: "None", value: "none" },
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
] satisfies ReadonlyArray<{ label: string; value: Priority; }>;

const formSchema = z.object({
    name: z.string(),
    description: z.string(),
    dueDate: z.union([z.date(), z.undefined()]),
    isCompleted: z.boolean(),
    priority: z.enum(priorityEnum.enumValues),
});

function optimisticNameUpdate({ queryClient, projectId, todoId, name }: optimisticInput & { name: string }) {
    queryClient.setQueryData<ProjectWithTodo>(
        projectKeys.detail(projectId),
        (project) => {
            if (!project) return undefined;
            return {
                ...project,
                todos: project.todos.map((todo) =>
                    todo.id === todoId
                        ? { ...todo, name }
                        : todo
                ),
            };
        }
    );

    queryClient.setQueryData<Todo[]>(
        todoKeys.today(),
        (todos) => {
            if (!todos) return undefined;
            return (
                todos.map((todo) =>
                    todo.id === todoId
                        ? { ...todo, name }
                        : todo,
                )
            );
        },
    );

    queryClient.setQueryData<Todo>(
        todoKeys.detail(todoId),
        (todo) => {
            if (!todo) return undefined;
            return {
                ...todo,
                name,
            };
        },
    );
}

export function TaskSidebar() {
    const { rightSidebar: { setOpen } } = useMultiSidebar();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const updateDateMutation = useUpdateTodoDate();
    const updateCompletedMutation = useUpdateTodoCompleted();
    const updatePriorityMutation = useUpdateTodoPriority();
    const debounceTaskUpdater = useDebounceTaskBasic();

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
            dueDate: todo?.dueDate
                ? new Date(todo.dueDate)
                : undefined,
            isCompleted: todo?.isCompleted ?? false,
            priority: todo?.priority ?? "none",
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
            priority: todo?.priority ?? "none",
        });
    }, [todoId]);


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
                                                optimisticNameUpdate({ queryClient, projectId: todo!.projectId, todoId: todoId!, name: e.target.value });
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
                                    <Field data-invalid={isInvalid} orientation="horizontal" className="grid grid-cols-[8rem_1fr] items-center! gap-4 text-sm">
                                        <FieldLabel htmlFor={field.name} className="text-sm gap-1"><CalendarIcon />Due date</FieldLabel>
                                        <FieldContent className="min-w-0">
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
                                                            updateDateMutation.mutate({
                                                                projectId: todo!.projectId,
                                                                todoId: todo!.id,
                                                                dueDate: date ?? null,
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
                                    <Field data-invalid={isInvalid} orientation="horizontal" className="grid grid-cols-[8rem_1fr] items-center! gap-4 text-sm">
                                        <FieldLabel htmlFor={field.name} className="text-sm gap-1"><ClipboardCheck />Status</FieldLabel>
                                        <FieldContent className="min-w-0">
                                            <Checkbox
                                                checked={field.state.value}
                                                onCheckedChange={async (e) => {
                                                    field.handleChange(e.valueOf());
                                                    updateCompletedMutation.mutate({
                                                        projectId: todo!.projectId,
                                                        todoId: todo!.id,
                                                        isCompleted: e.valueOf(),
                                                    });
                                                }} />
                                        </FieldContent>
                                    </Field>
                                )
                            }}
                        />

                        <form.Field
                            name="priority"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid} orientation="horizontal" className="grid grid-cols-[8rem_1fr] items-center! gap-4 text-sm">
                                        <FieldLabel htmlFor={field.name} className="text-sm gap-1"><Flag />Priority</FieldLabel>
                                        <FieldContent className="min-w-0">
                                            <Select
                                                name={field.name}
                                                value={field.state.value}
                                                onValueChange={(val) => {
                                                    field.handleChange(val as Priority);
                                                    updatePriorityMutation.mutate({
                                                        projectId: todo!.projectId,
                                                        todoId: todo!.id,
                                                        priority: val!,
                                                    })
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="None" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {priorities.map((priority) => (
                                                            <SelectItem key={priority.value} value={priority.value}>
                                                                {priority.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
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
