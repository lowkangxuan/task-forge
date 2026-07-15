import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarTrigger,
} from "@/components/ui/multisidebar"
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup } from "../ui/field";
import { ChevronsRight } from "lucide-react";
import { useMatch, useRouter } from "@tanstack/react-router";
import { CustomInput } from "../ui/custom-input";
import { useProjects } from "@/providers/ProjectsProvider";
import { useEffect } from "react";
import { useDebounceTaskName } from "@/server/debounce-fn";

const formSchema = z.object({
    name: z.string(),
    description: z.string(),
    isCompleted: z.boolean(),
    dueDate: z.union([z.date(), z.undefined()]),
});

export function TaskCreationSidebar() {
    const { localProjects, updateLocalProjects } = useProjects();
    const projectMatch = useMatch({
        from: "/_appLayout/projects/$projectId",
        shouldThrow: false,
    });
    const projectId = projectMatch?.params.projectId;
    const todoId = projectMatch?.search.t;
    const filteredTodo = localProjects.flatMap((proj) => proj.todos).find((todo) => todo.id === todoId);
    const debounceTaskName = useDebounceTaskName();

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
        onSubmit: async ({ value }) => {

        }
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

    return (
        <Sidebar variant="inset" side="right">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarTrigger side="right"><ChevronsRight /></SidebarTrigger>
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
                    className="px-16"
                >
                    <FieldGroup className="gap-0">
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
                                                debounceTaskName(todoId, e.target.value);
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
                                            onChange={(e) => field.handleChange(e.target.value)}
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
                </form>
            </SidebarContent>
        </Sidebar>
    )
}
