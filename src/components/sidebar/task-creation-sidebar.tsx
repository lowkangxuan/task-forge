import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarTrigger,
} from "@/components/ui/multisidebar"
import { CustomInput } from "../ui/custom-input"
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { ChevronsRight } from "lucide-react";
import { useMatch } from "@tanstack/react-router";

const formSchema = z.object({
    title: z.string().nonempty("Please enter your name"),
    description: z.string(),
    isCompleted: z.boolean(),
    dueDate: z.union([z.date(), z.undefined()]),
});

export function TaskCreationSidebar() {
    const form = useForm({
        defaultValues: {
            title: "",
            description: "",
            isCompleted: false,
            dueDate: undefined as Date | undefined,
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {

        }
    });
    const projectMatch = useMatch({
        from: "/_appLayout/projects/$projectId",
        shouldThrow: false,
    });
    const routeSearch = projectMatch?.search;
    console.log(routeSearch);

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
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            type="text"
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder="New Task"
                                            autoComplete="off"
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
                                            value={field.state.value}
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
