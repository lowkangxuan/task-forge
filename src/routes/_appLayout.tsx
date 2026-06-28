import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute("/_appLayout")({
    beforeLoad: async ({ context }) => {
        if (!context?.session?.user) {
            throw redirect({ to: "/signin"});
        }
    },
    component: AppLayoutComponent,
})

function AppLayoutComponent() {
    const context = Route.useRouteContext();
    console.log(context?.session?.user);

    return (
        <SidebarProvider>
            <AppSidebar name={context.session?.user.name} />
            <SidebarInset>
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    )
}
