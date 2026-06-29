import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Plus } from "lucide-react";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(5, "Project name must have at least 5 characters"),
    description: z.string(),
});

export function ProjectCreationDialog() {
    const [open, setOpen] = useState(false);
    const form = useForm({
        defaultValues: {
            name: "",
            description: "",
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                toast.success("Project successfully created!");
                form.reset();
                setOpen(false);
            }
            catch {

            }
        }
    });

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                if (!open) {
                    console.log("Dialog Closed");
                }
                form.reset();
                setOpen(open);
            }}
        >
            <DialogTrigger render={<button><Plus /> <span className="sr-only">Add Project</span></button>} />
            <DialogContent className="sm:max-w-sm">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="flex flex-col gap-4"
                >
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                        <form.Field
                            name="name"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Project Name</FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="text"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder="Grocery Shopping"
                                            autoComplete="off"
                                        />
                                        <FieldDescription>
                                            Choose a name now, you can change it later.
                                        </FieldDescription>
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                                        <FieldLabel htmlFor={field.name}>Description <span className="text-muted-foreground">(Optional)</span></FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="text"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder="For an important date"
                                            autoComplete="off"
                                        />
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                )
                            }}
                        />
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline">Cancel</Button>} />
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}