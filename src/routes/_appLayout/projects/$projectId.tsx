import { CustomInput } from '@/components/ui/custom-input';
import { Button } from '@/components/ui/button';
import { useMultiSidebar } from '@/components/ui/multisidebar';
import { getProject, updateProjectName } from '@/server/projects';
import { createNewTodo } from '@/server/todos';
import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router'
import * as z from "zod";
import { useEffect, useState } from 'react';
import { useProjects } from '@/providers/ProjectsProvider';
import { useDebouncedCallback } from 'use-debounce';

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

        return { project };
    },
    component: RouteComponent,
})

function ProjectViewComponent() {
    const router = useRouter();
    const { rightSidebar } = useMultiSidebar();
    const { projectId } = Route.useParams();
    const { localProjects, updateLocalProjects } = useProjects();
    const project = localProjects.find((proj) => proj.id === projectId);
    const [title, setTitle] = useState(project?.name);

    useEffect(() => {
        setTitle(project!.name);
    }, [project!.id]);

    const debounced = useDebouncedCallback(
        async (projectId, name) => {
            await updateProjectName({data: {projectId: projectId, name: name}});
            router.invalidate();
        }, 1000,
    )

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
                <CustomInput
                    key={project?.id}
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        updateLocalProjects((curr) => 
                            curr.map((proj) => 
                                proj.id === project?.id
                            ? {
                                ...proj,
                                name: e.target.value,
                            }
                            : proj,
                            )
                        )
                        debounced(project?.id, e.target.value);
                    }}
                    placeholder="Project Name"
                    variant="ghost"
                    size="4xl"
                />
            </div>
            <div className="flex flex-col">
                <Button className="w-fit" onClick={() => handleTaskCreation({ projectId: project!.id })}>
                    Add new task
                </Button>
                {project!.todos.map((todo) => {
                    return (
                        <Link
                            key={todo.id}
                            to={Route.fullPath}
                            params={{ projectId: todo.projectId }}
                            search={{ t: todo.id }}
                            onClick={() => rightSidebar.setOpen(true)}
                        >
                            {todo.title === "" ? "New Task" : todo.title}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

function RouteComponent() {
    return <ProjectViewComponent />
}
