import { getProject } from '@/server/projects';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_appLayout/projects/$projectId')({
    loader: async ({ params }) => {
        const project = await getProject({data: {projectId: params.projectId}});
        return project;
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { projectId } = Route.useParams();
    const project = Route.useLoaderData();
    console.log(project);
    return (
        project && <div>
            {projectId}
        </div>
    )
}
