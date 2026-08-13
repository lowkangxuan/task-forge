import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { todoQueryOptions } from "../api/todo-queries";
import { priorityEnum, type Priority, type Todo } from "@/db/schema";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { CalendarIcon, ClipboardCheck, Flag } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useUpdateTodoCompleted, useUpdateTodoDate, useUpdateTodoPriority } from "../api/todo-mutations";

type TodoDialogProp = {
    todo: Todo;
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

export function TodoDialog({ todo }: TodoDialogProp) {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();

    const updateDateMutation = useUpdateTodoDate();
    const updateCompletedMutation = useUpdateTodoCompleted();
    const updatePriorityMutation = useUpdateTodoPriority();

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
            <DialogContent className="sm:max-w-3xl h-3/4 grid-rows-[auto_1fr]">
                <DialogHeader>
                    <DialogTitle>{todo?.name}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-[1fr_14rem]">
                    <div>dwadda</div>
                    <form
                        id="task-form"
                        className="bg-accent p-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
                        <FieldGroup className="gap-2">
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
                        </FieldGroup>
                    </form>
                </div>
            </DialogContent>
        </Dialog >
    )
}