import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { signOut } from "@/lib/auth-client";
import { Link, useNavigate } from "@tanstack/react-router";
import { Calendar, Home, LogOut, Plus, User } from "lucide-react"
import { toast } from "sonner";
import { ProjectCreationDialog } from "./project-creation-dialog";

type User = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
} | undefined

export function AppSidebar({ name, handleProjectCreation }: { name?: string, handleProjectCreation: () => void }) {
    const navigate = useNavigate();

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
        <Sidebar variant="floating" collapsible="icon">
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
                                <Link
                                    to="/"
                                    activeProps={{ className: "bg-black text-accent" }}
                                    className=""
                                >
                                    <Home /> Home
                                </Link>
                            } />
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton render={<a href="/"><Calendar /> Calendar</a>} />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="uppercase">
                        Projects
                    </SidebarGroupLabel>
                    <SidebarGroupAction render={<ProjectCreationDialog />} onClick={handleProjectCreation} />
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                Button
                            </SidebarMenuButton>
                        </SidebarMenuItem>
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