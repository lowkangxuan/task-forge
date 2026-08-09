import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { createNewProject, deleteProject, duplicateProject, updateProjectName } from "@/features/project/server/projects";
import {
    projectKeys,
} from "@/features/project/api/project-queries";
import type { ProjectWithTodo } from "@/db/schema";
import { todoKeys } from "@/features/todo/api/todo-queries";

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            name: string,
            description: string,
        }) =>
            await createNewProject({
                data: {
                    name: input.name,
                    description: input.description,
                }
            }),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
        }
    })
}

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
            queryClient.invalidateQueries({ queryKey: todoKeys.all });
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
            queryClient.invalidateQueries({ queryKey: todoKeys.all });
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