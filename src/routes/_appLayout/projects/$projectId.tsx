import { CustomInput } from '@/components/ui/custom-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMultiSidebar } from '@/components/ui/multisidebar';
import { getProject } from '@/server/projects';
import { createNewTodo, getTodos } from '@/server/todos';
import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router'
import * as z from "zod";

const searchSchema = z.object({
    t: z.string().optional(),
})

export const Route = createFileRoute('/_appLayout/projects/$projectId')({
    validateSearch: searchSchema,
    loader: async ({ params }) => {
        const project = await getProject({ data: { projectId: params.projectId } });

        if (!project) {
            throw notFound();
        }

        const todos = await getTodos({ data: { projectId: project.id } });

        return { project, todos };
    },
    component: RouteComponent,
})

function ProjectViewComponent() {
    const { project, todos } = Route.useLoaderData();
    const { rightSidebar } = useMultiSidebar();
    const router = useRouter();

    async function handleTaskCreation({ projectId, title = "", description, isCompleted, dueDate }: {
        projectId: string,
        title?: string,
        description?: string,
        isCompleted?: boolean,
        dueDate?: Date,
    }) {
        await createNewTodo({
            data: {
                projectId,
                title,
                description,
                isCompleted,
                dueDate,
            }
        });

        rightSidebar.toggleSidebar();
        router.invalidate();
    }

    return (
        <div className="flex flex-col gap-4 px-16 py-8">
            <div className="flex gap-2">
                <Input key={project.id} value={project.name} className="md:text-3xl" />
            </div>
            <div className="flex flex-col">
                <Button className="w-fit" onClick={() => handleTaskCreation({ projectId: project.id })}>
                    Add new task
                </Button>
                {todos.map((todo) => {
                    if (todo.title === "") {
                        return (
                            <Link
                                to={Route.fullPath}
                                params={{ projectId: todo.projectId }}
                                search={{ t: todo.id }}
                                onClick={() => rightSidebar.setOpen(true)}
                            >
                                New Task
                            </Link>
                        )
                    }
                    else {
                        return (
                            <div key={todo.id}>{todo.title}</div>
                        )
                    }
                })}
            </div>
        </div>
    )
}

function RouteComponent() {
    const project = Route.useLoaderData();
    console.log(project);
    return <ProjectViewComponent />
}
