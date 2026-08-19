import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { labelsQueryOptions } from "../../api/todo-queries";
import { useUpdateTodoLabels } from "../../api/todo-mutations";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function TodoLabelPicker({ userId }: { userId: string }) {
    const { data: labels } = useQuery(labelsQueryOptions(userId));
    const [search, setSearch] = useState("");
    const updateTodoLabels = useUpdateTodoLabels(userId);

    const filteredLabels = labels?.filter((label) => {
        return label.name.includes(search);
    })

    return (
        <Popover>
            <PopoverTrigger render={<Button variant="outline" size="sm" />}>
                New Label
            </PopoverTrigger>
            <PopoverContent align="center">
                <Input
                    placeholder="Enter Label Name"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                />
                <div className="flex flex-col">
                    {filteredLabels && filteredLabels.length > 0
                        ? filteredLabels?.map((label) => {
                            return (
                                <Button variant="ghost" className="justify-start">
                                    {label.name}
                                </Button>
                            )
                        })
                        : "Label not found"}
                </div>
            </PopoverContent>
        </Popover>
    )
}