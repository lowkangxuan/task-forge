import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { TaskCreationSidebar } from '@/components/sidebar/task-creation-sidebar';
import { Button } from '@/components/ui/button';
import { MultiSidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/multisidebar';
import { ProjectsProvider } from '@/providers/ProjectsProvider';
import { getUserProjects } from '@/server/projects';
import { createFileRoute, Outlet, redirect, useMatchRoute } from '@tanstack/react-router';
import { EllipsisVerticalIcon } from 'lucide-react';

export const Route = createFileRoute("/_appLayout")({
    beforeLoad: async ({ context }) => {
        if (!context?.session?.user) {
            throw redirect({ to: "/signin" });
        }
    },
    loader: async () => {
        const userProjects = await getUserProjects();
        console.log(userProjects);
        return userProjects;
    },
    component: AppLayoutComponent,
})

function AppLayoutComponent() {
    const context = Route.useRouteContext();
    const loaderProjects = Route.useLoaderData();

    const matchRoute = useMatchRoute();
    const isProjectPage = matchRoute({ to: "/projects/$projectId" });

    return (
        <ProjectsProvider initialProjects={loaderProjects}>
            <MultiSidebarProvider defaultRightOpen={false}>
                <AppSidebar name={context.session?.user.name} />
                <SidebarInset className="px-4">
                    <header className="sticky top-0 flex justify-between h-16 shrink-0 items-center gap-2 bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <SidebarTrigger className="-ml-1" side="left" />
                        {isProjectPage &&
                            <Button variant="ghost" size="icon-lg">
                                <EllipsisVerticalIcon />
                            </Button>
                        }
                    </header>
                    <Outlet />
                </SidebarInset>
                <TaskCreationSidebar />
            </MultiSidebarProvider>
        </ProjectsProvider>
    )
}
