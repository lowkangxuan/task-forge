import type { ProjectWithTodo } from "@/db/schema";
import { projectKeys } from "@/features/project/api/project-queries";
import { getTodoById } from "@/server/functions/todos";
import { QueryClient, queryOptions, skipToken } from "@tanstack/react-query";

export const todoKeys = {
    all: ["todos"] as const,
    detail: (todoId: string) => [...todoKeys.all, "detail", todoId] as const,
}

export function todoQueryOptions(queryClient: QueryClient, todoId?: string) {
    return queryOptions({
        queryKey: todoKeys.detail(todoId ?? "none"),
        queryFn: todoId
            ? async () => await getTodoById({ data: { todoId } })
            : skipToken,
        initialData: () => {
            if (!todoId) return undefined;
            
            const projectQueries =
                queryClient.getQueriesData<ProjectWithTodo>({
                    queryKey: projectKeys.all,
                });

            for (const [, project] of projectQueries) {
                const todo = project?.todos.find(
                    (todo) => todo.id === todoId,
                );

                if (todo) return todo;
            }

            return undefined;
        },
    });
}