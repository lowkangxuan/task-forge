import { projectKeys } from "@/features/project/api/project-queries";
import { createNewTodo } from "@/server/functions/todos";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        
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

        onSettled: () => {
            return queryClient.invalidateQueries({
                queryKey: projectKeys.all,
            });
        },
    })
}