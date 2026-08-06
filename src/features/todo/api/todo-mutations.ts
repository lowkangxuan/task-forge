import { projectKeys } from "@/features/project/api/project-queries";
import { createNewTodo, deleteTodo } from "@/server/functions/todos";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (todoId: string) =>
            await deleteTodo({
                data: { todoId }
            }),

        onSuccess: (deletedTodo) => {
            return queryClient.invalidateQueries({
                queryKey: projectKeys.detail(deletedTodo.projectId),
                exact: true,
            })
        }
    })
}

export function useDuplicateTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            projectId: string,
            name: string,
            description?: string | null,
            isCompleted?: boolean,
            dueDate?: Date | null,
        }) =>
            await createNewTodo({ data: input }),

        onSuccess: () => {
            return queryClient.invalidateQueries({
                queryKey: projectKeys.all,
            });
        },
    })
}