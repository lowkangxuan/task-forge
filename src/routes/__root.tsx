import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"

import appCss from "../styles.css?url"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.tsx"
import { AppSidebar } from "@/components/app-sidebar.tsx"

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: "Task Forge",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: appCss,
            },
        ],
    }),
    shellComponent: RootDocument,
    notFoundComponent: () => <div>Not Found</div>,
})

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                            <SidebarTrigger className="ml-2" />
                        </header>
                        <main>
                            {children}
                            <TanStackDevtools
                                config={{
                                    position: "bottom-right",
                                }}
                                plugins={[
                                    {
                                        name: "Tanstack Router",
                                        render: <TanStackRouterDevtoolsPanel />,
                                    },
                                ]}
                            />
                            <Scripts />
                        </main>
                    </SidebarInset>
                </SidebarProvider>

            </body>
        </html>
    )
}
