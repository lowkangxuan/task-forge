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
import { Input } from "../ui/input";
import { ChevronsRight } from "lucide-react";
import { useLoaderData, useMatch, useRouter } from "@tanstack/react-router";
import { useDebouncedCallback } from "use-debounce";
import { updateTodoTitle } from "@/server/todos";
import { CustomInput } from "../ui/custom-input";
import { useProjects } from "@/providers/ProjectsProvider";

const formSchema = z.object({
    title: z.string(),
    description: z.string(),
    isCompleted: z.boolean(),
    dueDate: z.union([z.date(), z.undefined()]),
});

export function TaskCreationSidebar() {
    const { localProjects } = useProjects();
    const projectMatch = useMatch({
        from: "/_appLayout/projects/$projectId",
        shouldThrow: false,
    });
    const routeSearch = projectMatch?.search;
    const router = useRouter();
    // const { project: { todos }} = useLoaderData({ from: "/_appLayout/projects/$projectId" });
    const filterdTodo = localProjects.flatMap((proj) => proj.todos).find((todo) => todo.id === routeSearch?.t);
    // console.log(filterdTodo?.title);
    const form = useForm({
        defaultValues: {
            title: filterdTodo?.title,
            description: filterdTodo?.description,
            isCompleted: filterdTodo?.isCompleted,
            dueDate: undefined as Date | undefined,
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {

        }
    });

    const debounced = useDebouncedCallback(
        async (todoId, value) => {
            console.log(todoId, value);
            await updateTodoTitle({ data: { todoId: todoId, newTitle: value } });
            router.invalidate();
        },
        500,
    )

    return (
        <Sidebar variant="inset" side="right">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarTrigger side="right"><ChevronsRight /></SidebarTrigger>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {routeSearch?.t}
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
                >
                    <FieldGroup className="gap-0">
                        <form.Field
                            name="title"
                            children={(field) => {
                                console.log(field.state);
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
                                                debounced(routeSearch?.t, e.target.value);
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
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value ?? ""}
                                            type="text"
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder="Task Description"
                                            autoComplete="off"
                                            className="md:text-xl"
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
