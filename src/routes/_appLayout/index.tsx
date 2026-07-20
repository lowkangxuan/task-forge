import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_appLayout/")({
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
