import { queryOptions } from "@tanstack/react-query";

import {
    getProjectById,
    getUserProjects,
} from "@/server/functions/projects";

export const projectKeys = {
    all: ["projects"] as const,
    lists: () => [...projectKeys.all, "list"] as const,
    list: () => [...projectKeys.lists(), "current-user"] as const,
    details: () => [...projectKeys.all, "detail"] as const,
    detail: (projectId: string) =>
        [...projectKeys.details(), projectId] as const,
};

export function projectsQueryOptions() {
    return queryOptions({
        queryKey: projectKeys.list(),
        queryFn: async () => await getUserProjects(),
    });
}

export function projectQueryOptions(projectId: string) {
    return queryOptions({
        queryKey: projectKeys.detail(projectId),
        queryFn: async () =>
            await getProjectById({
                data: { projectId },
            }),
    });
}