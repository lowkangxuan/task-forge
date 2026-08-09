import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "@tanstack/react-router";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import { PROJECT_HEADER_ACTIONS, type ProjectHeaderActions } from "../project-actions";
import { useDeleteProject, useDuplicateProject } from "../api/project-mutations";

type ProjectActionsProp = {
    projectId: string;
}

export function ProjectActions({ projectId }: ProjectActionsProp) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const deleteProjectMutation = useDeleteProject();
    const duplicateProjectMutation = useDuplicateProject();

    async function handleActions(action: ProjectHeaderActions) {
        switch (action) {
            case "duplicate":
                duplicateProjectMutation.mutate(projectId);
                // await duplicateProject({ data: { projectId: projectId } });
                // await router.invalidate();
                break;

            case "delete":
                deleteProjectMutation.mutate(projectId);
                navigate({ to: "/today" });
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