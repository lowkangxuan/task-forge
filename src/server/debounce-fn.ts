import { getRouter } from "@/router";
import { useDebouncedCallback } from "use-debounce";
import { updateProjectName } from "./projects";
import { updateTodoName } from "./todos";

const WAIT = 1000; // 1000ms

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

export function useDebounceTaskName() {
    return useDebouncedCallback(
        async (todoId, name) => {
            await updateTodoName({ data: { todoId: todoId, newName: name } });
            await invalidateRouter();
        }, WAIT
    );
}

export function useDebounceTaskDesc() {
    
}