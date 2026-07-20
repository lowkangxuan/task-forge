import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { TaskCreationSidebar } from '@/components/sidebar/task-sidebar';
import { MultiSidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/multisidebar';
import { ProjectActions } from '@/features/project/components/project-actions';
import { ProjectsProvider } from '@/providers/ProjectsProvider';
import { getUserProjects } from '@/server/projects';
import { createFileRoute, Outlet, redirect, useMatchRoute } from '@tanstack/react-router';

export const Route = createFileRoute("/_appLayout")({
    beforeLoad: async ({ context }) => {
        if (!context?.session?.user) {
            throw redirect({ to: "/signin" });
        }
    },
    loader: async () => {
        const userProjects = await getUserProjects();
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
                            <ProjectActions />
                        }
                    </header>
                    <div className="px-16 py-8">
                        <Outlet />
                    </div>
                </SidebarInset>
                <TaskCreationSidebar />
            </MultiSidebarProvider>
        </ProjectsProvider>
    )
}
