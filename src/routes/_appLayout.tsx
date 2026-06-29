import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { authMiddleware } from '@/lib/auth-middleware';
import { getUserProjects } from '@/server/projects';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

export const Route = createFileRoute("/_appLayout")({
    beforeLoad: async ({ context }) => {
        if (!context?.session?.user) {
            throw redirect({ to: "/signin" });
        }
    },
    loader: async ({ context }) => {
        console.log(context);
        const userProjects = await getUserProjects({
            data: {
                userId: context.session!.user.id
            }
        });
        return userProjects;
    },
    component: AppLayoutComponent,
})

const createNewProject = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .handler(async ({ context }) => {
        console.log(context);
        // await db
        //     .insert(projects)
        //     .values(
        //         {
        //             userId: context?.user?.id,
        //             name: "Test",
        //         }
        //     );
    });

function AppLayoutComponent() {
    const context = Route.useRouteContext();
    const loaderData = Route.useLoaderData();
    console.log(loaderData);
    const handleProjectCreation = async () => {
        await createNewProject({});
    }

    return (
        <SidebarProvider>
            <AppSidebar name={context.session?.user.name} handleProjectCreation={handleProjectCreation} />
            <SidebarInset>
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    )
}
