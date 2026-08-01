import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { deleteProject, duplicateProject } from "@/server/functions/projects";
import type { GenericActions } from "@/types/generic-actions";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Copy, Ellipsis, Trash } from "lucide-react";
import { useState } from "react";
import { PROJECT_HEADER_ACTIONS } from "../project-actions";

type ProjectActionsProp = {
    projectId: string;
}

type ProjectAction = GenericActions;

export function ProjectActions({ projectId }: ProjectActionsProp) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const router = useRouter();

    async function handleActions(action: ProjectAction) {
        switch (action) {
            case "duplicate":
                await duplicateProject({ data: { projectId: projectId } });
                await router.invalidate();
                break;

            case "delete":
                navigate({ to: "/today" });
                await deleteProject({ data: { projectId: projectId } });
                await router.invalidate();
                break;

            default:
                break;
        }

    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={
                <Button variant="ghost" size="icon-lg">
                    <Ellipsis />
                </Button>
            } />
            <PopoverContent align="end" className="w-56 overflow-hidden rounded-lg p-0">
                <div className="flex flex-col">
                    {PROJECT_HEADER_ACTIONS.map((section, index) => (
                        <div key={index} className="flex flex-col p-2 gap-1 border-b last:border-none">
                            {section.map((item, index) => (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    className="justify-start text-sm font-normal gap-2"
                                    onClick={() => {
                                        handleActions(item.action);
                                        setOpen(false);
                                    }}
                                >
                                    <item.icon /> <span>{item.label}</span>
                                </Button>
                            ))}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}