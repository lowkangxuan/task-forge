import { SignupForm } from '@/components/signup-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/signup')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <SignupForm />
            </div>
        </div>
    )
}
