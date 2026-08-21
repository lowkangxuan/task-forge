import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { labelsQueryOptions } from "../../api/todo-queries";
import { useUpdateTodoLabels } from "../../api/todo-mutations";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type TodoLabelPickerProps = {
    userId: string;
    todoId: string;
    activeLabels: string[];
}

export function TodoLabelPicker({ userId, todoId, activeLabels }: TodoLabelPickerProps) {
    const { data: labels } = useQuery(labelsQueryOptions(userId));
    const [search, setSearch] = useState("");
    const updateTodoLabelsMutation = useUpdateTodoLabels(userId);

    const filteredLabels = labels?.filter((label) => {
        return label.name.includes(search);
    })

    return (
        <Popover>
            <PopoverTrigger render={<Button variant="outline" size="icon-sm" />}>
                <Plus />
            </PopoverTrigger>
            <PopoverContent align="center" className="p-0 gap-0">
                <div className="p-2.5">
                    <Input
                        placeholder="Enter Label Name"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                    />
                </div>
                <Separator />
                <div className="flex flex-col">
                    {filteredLabels && filteredLabels.length > 0
                        ? filteredLabels?.map((label) => {
                            const isLabelSelected = activeLabels.includes(label.name);
                            const label_const = {
                                userId,
                                id: label.id,
                                name: label.name,
                            };

                            return (
                                <Button
                                    key={label.id}
                                    variant="ghost"
                                    className="justify-start font-normal"
                                    onClick={() => {
                                        if (isLabelSelected) {
                                            updateTodoLabelsMutation.mutate({
                                                action: "remove",
                                                todoId,
                                                label: {
                                                    ...label_const,
                                                },
                                            });
                                        }
                                        else {
                                            updateTodoLabelsMutation.mutate({
                                                action: "add",
                                                todoId,
                                                label: {
                                                    ...label_const,
                                                },
                                            });
                                        }
                                    }}
                                >
                                    {label.name} {isLabelSelected ? <Check /> : ""}
                                </Button>
                            );
                        })
                        : <span className="px-2.5 py-2">Label not found</span>}
                </div>

            </PopoverContent>
        </Popover>
    )
}