import { CustomInput } from '@/components/ui/custom-input';
import { Button } from '@/components/ui/button';
import { useMultiSidebar } from '@/components/ui/multisidebar';
import { createNewTodo } from '@/server/todos';
import { createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import * as z from "zod";
import { useEffect, useState } from 'react';
import { useProjects } from '@/providers/ProjectsProvider';
import { useDebounceProjectName } from '@/server/debounce-fn';
import { TodoRow } from '@/features/project/components/todo-row';
import { verifyProjectOwnership } from '@/server/projects';

const searchSchema = z.object({
    t: z.string().optional(),
})

export const Route = createFileRoute('/_appLayout/projects/$projectId')({
    beforeLoad: async ({ params }) => {
        const result = await verifyProjectOwnership({ data: { projectId: params.projectId } });

        if (!result) {
            throw notFound();
        }
    },
    validateSearch: searchSchema,
    component: RouteComponent,
})

function ProjectViewComponent() {
    const router = useRouter();
    const { rightSidebar } = useMultiSidebar();
    const { projectId } = Route.useParams();
    const { localProjects, updateLocalProjects } = useProjects();
    const project = localProjects.find((proj) => proj.id === projectId);
    const [title, setTitle] = useState(project?.name);
    const debounceProjectName = useDebounceProjectName();

    useEffect(() => {
        setTitle(project!.name);
    }, [project!.id]);

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
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <CustomInput
                    key={project?.id}
                    placeholder="Project Name"
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
                        debounceProjectName(project?.id, e.target.value);
                    }}
                    variant="ghost"
                    size="3xl"
                />
            </div>
            <div className="flex flex-col gap-1">
                <Button className="w-fit" onClick={() => handleTaskCreation({ projectId: project!.id })}>
                    Add new task
                </Button>
                <div className="flex flex-col gap-1">
                    {project!.todos.map((todo) => {
                        return (
                            <TodoRow key={todo.id} todo={todo} path={Route.fullPath} />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function RouteComponent() {
    return <ProjectViewComponent />
}
