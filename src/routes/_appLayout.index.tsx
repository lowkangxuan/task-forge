import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar";
import { authMiddleware } from "@/lib/auth-middleware";

export const Route = createFileRoute("/_appLayout/")({
    component: App,
    server: {
        middleware: [authMiddleware],
    }
});

function App() {
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <SidebarTrigger className="ml-2" />
            </header>
            <div className="flex min-h-svh p-6">
                <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
                    <div>
                        <h1 className="font-medium">Project ready!</h1>
                        <p>You may now add components and start building.</p>
                        <p>
                            We&apos;ve already added the button component for you.
                        </p>
                        <Button className="mt-2">Button</Button>
                    </div>
                </div>
            </div>
        </>
    )
}
