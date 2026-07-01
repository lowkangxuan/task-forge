import { Button } from '@/components/ui/button';
import { getProject } from '@/server/projects';
import { createFileRoute, notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/_appLayout/projects/$projectId')({
    loader: async ({ params }) => {
        const project = await getProject({ data: { projectId: params.projectId } });

        if (!project) {
            throw notFound();
        }

        return project;
    },
    component: RouteComponent,
})

function ProjectViewComponent() {
    const project = Route.useLoaderData();
    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <h1>{project.name}</h1>
                <Button>
                    Edit
                </Button>
                <Button>
                    Delete
                </Button>
            </div>
            <div>
                wadwad
            </div>
        </div>
    )
}

function RouteComponent() {
    const project = Route.useLoaderData();
    console.log(project);
    return <ProjectViewComponent />
}
