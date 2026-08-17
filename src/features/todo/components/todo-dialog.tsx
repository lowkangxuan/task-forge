import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { todoKeys } from "../api/todo-queries";
import { priorityEnum, type Priority, type ProjectWithTodo, type Todo, type TodoWithProjectWithLabels } from "@/db/schema";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { CalendarIcon, ClipboardCheck, Flag, Tags } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useUpdateTodoCompleted, useUpdateTodoDate, useUpdateTodoPriority } from "../api/todo-mutations";
import { CustomInput } from "@/components/ui/custom-input";
import { useDebounceTaskBasic } from "@/server/debounce-fn";
import { projectKeys } from "@/features/project/api/project-queries";

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
    label: z.string(),
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

export function TodoDialog({ userId, todo }: {userId: string, todo: TodoWithProjectWithLabels}) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const form = useForm({
        defaultValues: {
            name: todo?.name ?? "",
            description: todo?.description ?? "",
            dueDate: todo?.dueDate
                ? new Date(todo.dueDate)
                : undefined,
            isCompleted: todo?.isCompleted ?? false,
            priority: todo?.priority ?? "none",
            label: "",
        },
        validators: {
            onSubmit: formSchema,
        },

    });

    const debounceTaskUpdater = useDebounceTaskBasic();
    const updateDateMutation = useUpdateTodoDate();
    const updateCompletedMutation = useUpdateTodoCompleted();
    const updatePriorityMutation = useUpdateTodoPriority();


    return (
        <Dialog open={open} onOpenChange={(open) => setOpen(open)} onOpenChangeComplete={(open) => {
            if (!open) {
                navigate({
                    to: ".",
                    search: (prev) => ({ ...prev, todo: undefined }),
                    replace: true,
                });
            }
        }}>
            <DialogContent className="sm:max-w-3xl h-3/4 grid-rows-[auto_1fr] gap-0 p-0 overflow-clip">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>{todo?.parentProject.name}</DialogTitle>
                </DialogHeader>
                <form
                    id="task-form"
                    className="grid grid-cols-[1fr_14rem]"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup className="gap-0 p-4">
                        <form.Field
                            name="name"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <div
                                            ref={(node) => {
                                                if (!node) return;
                                                if (node.dataset.todoId !== todo.id) {
                                                    node.innerText = todo.name ?? "";
                                                    node.dataset.todoId = todo.id;
                                                }
                                            }}
                                            role="textbox"
                                            contentEditable={isEditing}
                                            suppressContentEditableWarning
                                            aria-multiline="true"
                                            aria-readonly={!isEditing}
                                            data-placeholder="New Task"
                                            onClick={(e) => {
                                                if (!isEditing) {
                                                    const element = e.currentTarget;
                                                    setIsEditing(true);
                                                    requestAnimationFrame(() => {
                                                        element.focus();
                                                    });
                                                }
                                            }}
                                            onBlur={field.handleBlur}
                                            onInput={(e) => {
                                                const value = e.currentTarget.innerText;
                                                field.handleChange(value);
                                                optimisticNameUpdate({ queryClient, projectId: todo!.projectId, todoId: todo!.id, name: value });
                                                debounceTaskUpdater({ todoId: todo!.id, updates: { name: value } });
                                            }}
                                            className="text-2xl font-medium border-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
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
                                                await debounceTaskUpdater({ todoId: todo!.id, updates: { description: e.target.value } });
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
                    <FieldGroup className="gap-2 p-4 bg-accent">
                        <form.Field
                            name="dueDate"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid} className="gap-0 text-sm">
                                        <FieldLabel htmlFor={field.name} className="text-sm">Due date</FieldLabel>
                                        <FieldContent className="flex-row items-center gap-2 min-w-0">
                                            <CalendarIcon size={16} />
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
                                    <Field data-invalid={isInvalid} className="gap-0 text-sm">
                                        <FieldLabel htmlFor={field.name} className="text-sm">Status</FieldLabel>
                                        <FieldContent className="flex-row items-center gap-2 min-h-8">
                                            <ClipboardCheck size={16} />
                                            <Checkbox
                                                name={field.name}
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
                                    <Field data-invalid={isInvalid} className="gap-0 text-sm">
                                        <FieldLabel htmlFor={field.name} className="text-sm">Priority</FieldLabel>
                                        <FieldContent className="flex-row items-center gap-2 min-w-0">
                                            <Flag size={16} />
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
                                                items={priorities}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="None" />
                                                </SelectTrigger>
                                                <SelectContent alignItemWithTrigger={false} align="start">
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

                        <Field className="gap-0 text-sm">
                            <FieldLabel className="text-sm">Labels</FieldLabel>
                            <FieldContent className="flex-row items-center gap-2 min-w-0">
                                <Popover>
                                    <PopoverTrigger render={<Button variant="outline" size="sm" />}>
                                        New Label
                                    </PopoverTrigger>
                                    <PopoverContent align="center">
                                        Test
                                    </PopoverContent>
                                </Popover>
                            </FieldContent>
                        </Field>
                    </FieldGroup>
                </form>
            </DialogContent>
        </Dialog >
    )
}