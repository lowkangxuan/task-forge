import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_appLayout/")({
    beforeLoad: () => {
        throw redirect({ to: "/today" });
    },
    component: App,
});

function App() {
    return (
        <div>
            <h2 className="font-bold text-4xl">
                Today
            </h2>
        </div>
    )
}
