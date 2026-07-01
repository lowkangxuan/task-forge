import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { getUserProjects } from '@/server/projects';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

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
    const userProjects = Route.useLoaderData();
    console.log(userProjects);

    return (
        <SidebarProvider>
            <AppSidebar name={context.session?.user.name} projects={userProjects} />
            <SidebarInset className="px-4">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <SidebarTrigger className="-ml-1" />
                </header>
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    )
}
