import { CircleDashed } from "lucide-react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SidebarMenuButton } from "@/components/ui/multisidebar";
import { Link, useRouter } from "@tanstack/react-router";
import {
    PROJECT_SIDEBAR_ACTIONS,
    type ProjectSidebarActions,
} from "@/features/project/project-actions";
import { deleteProject, duplicateProject } from "@/server/functions/projects";
import { toast } from "sonner";

type SidebarProjectButtonProps = {
    projectId: string;
    name: string;
};

async function copyLink(projectId: string) {
    const url = `${window.location.origin}/projects/${projectId}`;

    try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
    } catch (err) {
        console.error("Failed to copy link", err);
    }
}

export function SidebarProjectButton({ projectId, name }: SidebarProjectButtonProps) {
    const router = useRouter();

    async function handleAction(action: ProjectSidebarActions) {
        switch (action) {
            case "copy_link": {
                await copyLink(projectId);
                break;
            }

            case "duplicate": {
                await duplicateProject({ data: { projectId: projectId } });
                router.invalidate();
                break;
            }

            case "delete": {
                await deleteProject({ data: { projectId: projectId } });
                router.invalidate();
                break;
            }

            // Navigation is handled by the rendered Link.
            case "new_tab": {
                break;
            }
        }
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger render={
                <SidebarMenuButton
                    render={
                        <Link
                            to="/projects/$projectId"
                            params={{ projectId: projectId }}
                            activeProps={{
                                className: "bg-primary",
                            }}
                            preload="intent"
                            className="overflow-clip"
                        />
                    }
                >
                    <CircleDashed />
                    <span className="pr-6">{name}</span>
                </SidebarMenuButton>
            }
            />

            <ContextMenuContent>
                {PROJECT_SIDEBAR_ACTIONS.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                        <ContextMenuGroup>
                            {section.map((item) => {
                                const Icon = item.icon;

                                if (item.action === "new_tab") {
                                    return (
                                        <ContextMenuItem
                                            key={item.action}
                                            render={
                                                <Link
                                                    to="/projects/$projectId"
                                                    params={{ projectId: projectId }}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                />
                                            }
                                        >
                                            <Icon />
                                            {item.label}
                                        </ContextMenuItem>
                                    );
                                }

                                return (
                                    <ContextMenuItem
                                        key={item.action}
                                        variant={
                                            item.action === "delete"
                                                ? "destructive"
                                                : "default"
                                        }
                                        onClick={() => handleAction(item.action)}
                                    >
                                        <Icon />
                                        {item.label}
                                    </ContextMenuItem>
                                );
                            })}
                        </ContextMenuGroup>

                        {sectionIndex !==
                            PROJECT_SIDEBAR_ACTIONS.length - 1 && (
                                <ContextMenuSeparator />
                            )}
                    </div>
                ))}
            </ContextMenuContent>
        </ContextMenu>
    );
}