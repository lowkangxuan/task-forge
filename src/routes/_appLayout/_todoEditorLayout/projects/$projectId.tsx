import { CustomInput } from '@/components/ui/custom-input';
import { Button } from '@/components/ui/button';
import { createFileRoute, notFound } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import { useDebounceProjectName } from '@/server/debounce-fn';
import { TodoRow } from '@/features/todo/components/todo-row';
import { verifyProjectOwnership } from "@/features/project/server/projects";
import { projectKeys, projectQueryOptions } from '@/features/project/api/project-queries';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { ProjectWithTodo } from '@/db/schema';
import { useCreateTodo } from '@/features/todo/api/todo-mutations';

export const Route = createFileRoute('/_appLayout/_todoEditorLayout/projects/$projectId')({
    beforeLoad: async ({ params }) => {
        const result = await verifyProjectOwnership({ data: { projectId: params.projectId } });

        if (!result) {
            throw notFound();
        }
    },
    loader: async ({ context, params }) => {
        context.queryClient.ensureQueryData(
            projectQueryOptions(params.projectId),
        )
    },
    component: RouteComponent,
})

function ProjectViewComponent() {
    const queryClient = useQueryClient();
    const createTodoMutation = useCreateTodo();
    const { projectId } = Route.useParams();
    const { data: project } = useSuspenseQuery(projectQueryOptions(projectId));
    const [title, setTitle] = useState(project!.name);
    const debounceProjectName = useDebounceProjectName();

    useEffect(() => {
        setTitle(project!.name);
    }, [project!.id]);

    async function handleTaskCreation({ projectId, name = "", description, isCompleted, dueDate }: {
        projectId: string,
        name?: string,
        description?: string,
        isCompleted?: boolean,
        dueDate?: Date,
    }) {
        createTodoMutation.mutate({
            projectId,
            name,
            description,
            isCompleted,
            dueDate,
        });
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
                        queryClient.setQueryData<ProjectWithTodo[]>(
                            projectKeys.list(),
                            (projects) =>
                                projects?.map((project) =>
                                    project.id === projectId
                                        ? { ...project, name: e.target.value }
                                        : project,
                                ),

                        );
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
                <div className="flex flex-col gap-1 flex-1 min-h-0">
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
