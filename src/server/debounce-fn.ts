import { getRouter } from "@/router";
import { useDebouncedCallback } from "use-debounce";
import { updateProjectName } from "./functions/projects";
import { updateTodo } from "./functions/todos";

const WAIT = 300; // in milliseconds

async function invalidateRouter() {
    await getRouter().invalidate();
}

export function useDebounceProjectName() {
    return useDebouncedCallback(
        async (projectId, name) => {
            await updateProjectName({ data: { projectId: projectId, name: name } });
            await invalidateRouter();
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