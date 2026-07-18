import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useMultiSidebar,
} from "@/components/ui/multisidebar"
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { CalendarIcon, ChevronsRight, ClipboardCheck } from "lucide-react";
import { Link, useMatch } from "@tanstack/react-router";
import { CustomInput } from "../ui/custom-input";
import { useProjects } from "@/providers/ProjectsProvider";
import { useEffect } from "react";
import { useDebounceTaskBasic } from "@/server/debounce-fn";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button, buttonVariants } from "../ui/button";
import { format } from "date-fns";
import { Checkbox } from "../ui/checkbox";

const formSchema = z.object({
    name: z.string(),
    description: z.string(),
    isCompleted: z.boolean(),
    dueDate: z.union([z.date(), z.undefined()]),
});

export function TaskCreationSidebar() {
    const { rightSidebar: { setOpen } } = useMultiSidebar();
    const { localProjects, updateLocalProjects } = useProjects();
    const projectMatch = useMatch({
        from: "/_appLayout/projects/$projectId",
        shouldThrow: false,
    });
    const projectId = projectMatch?.params.projectId;
    const todoId = projectMatch?.search.t;
    const filteredTodo = localProjects.flatMap((proj) => proj.todos).find((todo) => todo.id === todoId);
    const debounceTaskUpdater = useDebounceTaskBasic();

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
        setOpen(todoId !== undefined);
    }, [todoId, setOpen]);

    return (
        <Sidebar variant="inset" side="right">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link
                            to="/projects/$projectId"
                            params={{projectId: projectId!}}
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
                                            onChange={(e) => {
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
                                                debounceTaskUpdater({ todoId: todoId!, updates: { name: e.target.value } });
                                            }}
                                            aria-invalid={isInvalid}
                                            placeholder="New Task"
                                            autoComplete="off"
                                            variant="ghost"
                                            size="4xl"
                                        />
                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors} />
                                        )}
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
                                            onChange={(e) => {
                                                field.handleChange(e.target.value)
                                                debounceTaskUpdater({ todoId: todoId!, updates: { description: e.target.value } });
                                            }}
                                            aria-invalid={isInvalid}
                                            placeholder="Task Description"
                                            autoComplete="off"
                                            variant="ghost"
                                            size="2xl"
                                        />
                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors} />
                                        )}
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
                                                        onSelect={(date) => field.handleChange(date)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
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
                                            <Checkbox checked={field.state.value} onCheckedChange={(e) => field.handleChange(e.valueOf())} />
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
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
