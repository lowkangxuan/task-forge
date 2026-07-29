import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/multisidebar"
import { signOut } from "@/lib/auth-client";
import { Link, useNavigate } from "@tanstack/react-router";
import { Calendar, CircleDashed, Home, LogOut, User } from "lucide-react"
import { toast } from "sonner";
import { ProjectCreationDialog } from "./project-creation-dialog";
import { useProjects } from "@/providers/ProjectsProvider";
import { SidebarLink } from "./sidebar-link";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "../ui/context-menu";

interface AppSidebarProps {
    name?: string,
}

export function AppSidebar({ name }: AppSidebarProps) {
    const navigate = useNavigate();
    const { localProjects } = useProjects();

    async function SignOut() {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Successfully Signed Out");
                    navigate({ to: "/signin" });
                }
            }
        });
    }

    return (
        <Sidebar variant="inset" collapsible="icon" side="left">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <User size={16} />
                            </div>
                            Username
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="uppercase">
                        General
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton render={
                                <SidebarLink
                                    to="/today"
                                    activeProps={{ className: "bg-primary" }}
                                >
                                    <Home /> Today
                                </SidebarLink>
                            } />
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton render={
                                <SidebarLink
                                    to="/upcoming"
                                >
                                    <Calendar /> Upcoming
                                </SidebarLink>
                            } />
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton render={<a href="/"><Calendar /> Calendar</a>} />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="uppercase">
                        Projects
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {localProjects.map((proj) => {
                            return (
                                <SidebarMenuItem key={proj.id}>
                                    <ContextMenu>
                                        <ContextMenuTrigger render={
                                            <SidebarMenuButton render={
                                                <Link
                                                    to="/projects/$projectId"
                                                    activeProps={{ className: "bg-primary" }}
                                                    params={{ projectId: String(proj.id) }}
                                                    preload="intent"
                                                    className="overflow-clip"
                                                />
                                            }>
                                                <CircleDashed />
                                                <span className="pr-6">{proj.name}</span>
                                            </SidebarMenuButton>
                                        } />
                                        <ContextMenuContent>
                                            <ContextMenuItem>Profile</ContextMenuItem>
                                            <ContextMenuItem>Billing</ContextMenuItem>
                                            <ContextMenuItem>Team</ContextMenuItem>
                                            <ContextMenuItem>Subscription</ContextMenuItem>
                                        </ContextMenuContent>
                                    </ContextMenu>
                                    <SidebarMenuBadge>
                                        {proj.todos.length}
                                    </SidebarMenuBadge>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarMenu>
                        <ProjectCreationDialog />
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={SignOut}>
                            {name && (
                                <>
                                    <LogOut />
                                    <span>Sign Out</span>
                                </>
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}