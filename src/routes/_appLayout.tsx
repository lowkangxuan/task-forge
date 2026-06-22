import { AppSidebar } from '@/components/app-sidebar.tsx'
import { SidebarInset } from '@/components/ui/sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute("/_appLayout")({
    component: AppLayoutComponent,
})

function AppLayoutComponent() {
    return (
        <>
            <AppSidebar />
            <SidebarInset>
                <Outlet />
            </SidebarInset>
        </>
    )
}
