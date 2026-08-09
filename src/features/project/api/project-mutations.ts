import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { deleteProject, duplicateProject, updateProjectName } from "@/server/functions/projects";
import {
    projectKeys,
} from "@/features/project/api/project-queries";
import type { ProjectWithTodo } from "@/db/schema";

export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (projectId: string) =>
            await deleteProject({
                data: { projectId },
            }),

        onSuccess: async (_result, projectId) => {
            queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
            queryClient.invalidateQueries({ queryKey: projectKeys.list() });
        },
    });
}

export function useDuplicateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (projectId: string) =>
            await duplicateProject({
                data: { projectId },
            }),

        onSuccess: (duplicatedProject) => {
            if (!duplicatedProject) return;

            queryClient.setQueryData<ProjectWithTodo[]>(

                projectKeys.list(),

                (projects = []) => [...projects, duplicatedProject],

            );

        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
        },
    });
}

export function useRenameProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            projectId: string,
            name: string,
        }) =>
            await updateProjectName({ data: input, }),

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
        },
    })
}