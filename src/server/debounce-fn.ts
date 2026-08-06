import { getRouter } from "@/router";
import { useDebouncedCallback } from "use-debounce";
import { updateTodo } from "./functions/todos";
import { useRenameProject } from "@/features/project/api/project-mutations";

const WAIT = 300; // in milliseconds

async function invalidateRouter() {
    await getRouter().invalidate();
}

export function useDebounceProjectName() {
    const renameProject = useRenameProject();

    return useDebouncedCallback(
        (projectId, name) => {
            renameProject.mutate({ projectId, name });
        }, WAIT
    );
}

export function useDebounceTaskBasic() {
    return useDebouncedCallback(
        async (data: {
            todoId: string,
            updates: {
                name?: string,
                description?: string,
            }
        }) => {
            await updateTodo({
                data: {
                    todoId: data.todoId,
                    updates: data.updates,
                }
            });
            await invalidateRouter();
        }, WAIT
    );
}