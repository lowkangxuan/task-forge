import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { deleteProject } from "@/server/functions/projects";
import {
    projectKeys,
} from "@/features/project/api/project-queries";

export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (projectId: string) =>
            await deleteProject({
                data: { projectId },
            }),

        onSuccess: async (_result, projectId) => {
            queryClient.removeQueries({
                queryKey: projectKeys.detail(projectId),
            });

            await queryClient.invalidateQueries({
                queryKey: projectKeys.lists(),
            });
        },
    });
}