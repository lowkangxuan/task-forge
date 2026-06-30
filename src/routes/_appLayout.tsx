import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
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
            <SidebarInset>
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    )
}
