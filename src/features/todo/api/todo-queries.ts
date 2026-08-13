import type { ProjectWithTodo } from "@/db/schema";
import { projectKeys } from "@/features/project/api/project-queries";
import { getTodayTodos, getTodoById, getUpcomingTodos } from "@/features/todo/server/todos";
import { QueryClient, queryOptions, skipToken } from "@tanstack/react-query";

export const todoKeys = {
    all: ["todos"] as const,
    detail: (todoId: string) => [...todoKeys.all, "detail", todoId] as const,
    today: () => [...todoKeys.all, "today"] as const,
    upcoming: () => [...todoKeys.all, "upcoming"] as const,
}

export function todoQueryOptions(queryClient: QueryClient, todoId?: string) {
    return queryOptions({
        queryKey: todoKeys.detail(todoId ?? "none"),
        queryFn: todoId
            ? async () => await getTodoById({ data: { todoId } })
            : skipToken,
        initialData: () => {
            if (!todoId) return null;

            const projectQueries =
                queryClient.getQueryData<ProjectWithTodo[]>(
                    projectKeys.list(),
                );

            if (!projectQueries) return null;

            for (const project of projectQueries!) {
                const todo = project?.todos.find(
                    (todo) => todo.id === todoId,
                );

                if (todo) return todo;
            }

            return null;
        },
    });
}

export function todayTodoQueryOptions() {
    return queryOptions({
        queryKey: todoKeys.today(),
        queryFn: async () =>
            await getTodayTodos(),
    });
}

export function upcomingTodoQueryOptions() {
    return queryOptions({
        queryKey: todoKeys.upcoming(),
        queryFn: async() =>
            await getUpcomingTodos(),
    });
}