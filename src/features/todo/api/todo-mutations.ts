import type { Priority, ProjectWithTodo, Todo } from "@/db/schema";
import { projectKeys } from "@/features/project/api/project-queries";
import { createNewTodo, deleteTodo, updateTodo } from "@/features/todo/server/todos";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { todoKeys } from "./todo-queries";

export function useCreateTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            projectId: string,
            name: string,
            description?: string,
            isCompleted?: boolean,
            dueDate?: Date,
        }) =>
            await createNewTodo({ data: input }),

        onSuccess: ({ projectId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.list() });
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
        },
    })
}

export function useDeleteTodo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (todoId: string) =>
            await deleteTodo({
                data: { todoId }
            }),

        onSuccess: (deletedTodo) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(deletedTodo.projectId), exact: true });
            queryClient.invalidateQueries({ queryKey: projectKeys.list() });
            queryClient.invalidateQueries({ queryKey: todoKeys.today() });
            queryClient.invalidateQueries({ queryKey: todoKeys.upcoming() });
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
            priority?: Priority,
            isCompleted?: boolean,
            dueDate?: Date | null,
        }) =>
            await createNewTodo({ data: input }),

        onSuccess: (newTodo) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.list() });
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(newTodo.projectId) });
            queryClient.invalidateQueries({ queryKey: todoKeys.today() });
            queryClient.invalidateQueries({ queryKey: todoKeys.upcoming() });
        },
    })
}

export function useUpdateTodoDate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            projectId: string,
            todoId: string,
            dueDate: Date | null,
        }) =>
            await updateTodo({
                data: {
                    todoId: input.todoId,
                    updates: {
                        dueDate: input.dueDate ?? null,
                    }
                }
            }),

        onMutate: (variables) => {
            const { projectId, todoId, dueDate } = variables;
            queryClient.setQueryData<ProjectWithTodo>(
                projectKeys.detail(projectId),
                (project) => {
                    if (!project) return undefined;
                    return {
                        ...project,
                        todos: project.todos.map((todo) =>
                            todo.id === todoId
                                ? { ...todo, dueDate }
                                : todo
                        ),
                    };
                }
            );

            queryClient.setQueryData<Todo[]>(
                todoKeys.today(),
                (todos) => {
                    if (!todos) return undefined;
                    return (
                        todos.map((todo) =>
                            todo.id === todoId
                                ? { ...todo, dueDate }
                                : todo,
                        )
                    );
                },
            );

            queryClient.setQueryData<Todo>(
                todoKeys.detail(todoId),
                (todo) => {
                    if (!todo) return undefined;
                    return {
                        ...todo,
                        dueDate,
                    };
                },
            );
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
            queryClient.invalidateQueries({ queryKey: todoKeys.all });
        }
    })
}

export function useUpdateTodoCompleted() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            projectId: string,
            todoId: string,
            isCompleted: boolean,
        }) =>
            await updateTodo({
                data: {
                    todoId: input.todoId,
                    updates: {
                        isCompleted: input.isCompleted,
                    }
                }
            }),

        onMutate: (variables) => {
            const { projectId, todoId, isCompleted } = variables;
            queryClient.setQueryData<ProjectWithTodo>(
                projectKeys.detail(projectId),
                (project) => {
                    if (!project) return undefined;
                    return {
                        ...project,
                        todos: project.todos.map((todo) =>
                            todo.id === todoId
                                ? { ...todo, isCompleted }
                                : todo
                        ),
                    };
                }
            );

            queryClient.setQueryData<Todo[]>(
                todoKeys.today(),
                (todos) => {
                    if (!todos) return undefined;
                    return (
                        todos.map((todo) =>
                            todo.id === todoId
                                ? { ...todo, isCompleted }
                                : todo,
                        )
                    );
                },
            );

            queryClient.setQueryData<Todo>(
                todoKeys.detail(todoId),
                (todo) => {
                    if (!todo) return undefined;
                    return {
                        ...todo,
                        isCompleted,
                    };
                },
            );
        },

        onSuccess: (_, { projectId, todoId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.list() });
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
            queryClient.invalidateQueries({ queryKey: todoKeys.today() });
            queryClient.invalidateQueries({ queryKey: todoKeys.upcoming() });
            queryClient.invalidateQueries({ queryKey: todoKeys.detail(todoId) });
        }
    })
}

export function useUpdateTodoPriority() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            projectId: string,
            todoId: string,
            priority: Priority,
        }) =>
            await updateTodo({
                data: {
                    todoId: input.todoId,
                    updates: {
                        priority: input.priority
                    }
                }
            }),

        onMutate: (variables) => {
            const { projectId, todoId, priority } = variables;
            queryClient.setQueryData<ProjectWithTodo>(
                projectKeys.detail(projectId),
                (project) => {
                    if (!project) return undefined;
                    return {
                        ...project,
                        todos: project.todos.map((todo) =>
                            todo.id === todoId
                                ? { ...todo, priority }
                                : todo
                        ),
                    };
                }
            );

            queryClient.setQueryData<Todo[]>(
                todoKeys.today(),
                (todos) => {
                    if (!todos) return undefined;
                    return (
                        todos.map((todo) =>
                            todo.id === todoId
                                ? { ...todo, priority }
                                : todo,
                        )
                    );
                },
            );

            queryClient.setQueryData<Todo>(
                todoKeys.detail(todoId),
                (todo) => {
                    if (!todo) return undefined;
                    return {
                        ...todo,
                        priority,
                    };
                },
            );
        },

        onSuccess: (_, { todoId }) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
            queryClient.invalidateQueries({ queryKey: todoKeys.today() });
            queryClient.invalidateQueries({ queryKey: todoKeys.upcoming() });
            queryClient.invalidateQueries({ queryKey: todoKeys.detail(todoId) });
        }
    });
}