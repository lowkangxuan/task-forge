import { AppSidebar } from '@/features/sidebar/components/app-sidebar';
import { TaskSidebar } from '@/features/sidebar/components/task-sidebar';
import { MultiSidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/multisidebar';
import { ProjectActions } from '@/features/project/components/project-header-actions';
import { createFileRoute, Outlet, redirect, useMatchRoute } from '@tanstack/react-router';
import { projectsQueryOptions } from '@/features/project/api/project-queries';

export const Route = createFileRoute("/_appLayout")({
    beforeLoad: async ({ context }) => {
        if (!context?.session?.user) {
            throw redirect({ to: "/signin" });
        }
    },
    loader: async ({ context }) => {
        context.queryClient.prefetchQuery(
            projectsQueryOptions(),
        );
    },
    component: AppLayoutComponent,
})

function AppLayoutComponent() {
    const context = Route.useRouteContext();
    const matchRoute = useMatchRoute();
    const projectIdParam = matchRoute({ to: "/projects/$projectId" });

    return (
            <MultiSidebarProvider defaultRightOpen={false}>
                <AppSidebar name={context.session?.user.name} />
                <SidebarInset className="px-4">
                    <header className="sticky top-0 flex justify-between h-16 shrink-0 items-center gap-2 bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <SidebarTrigger className="-ml-1" side="left" />
                        {projectIdParam &&
                            <ProjectActions projectId={projectIdParam.projectId} />
                        }
                    </header>
                    <div className="flex flex-col flex-1 px-16 py-8 min-h-0 h-dvh overflow-hidden">
                        <Outlet />
                    </div>
                </SidebarInset>
                <TaskSidebar />
            </MultiSidebarProvider>
    )
}
