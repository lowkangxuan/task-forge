import { type Label, type Priority, type ProjectWithTodo, type Todo, type TodoWithLabels } from "@/db/schema";
import { projectKeys } from "@/features/project/api/project-queries";
import { addLabelIntoTodo, createNewLabel, createNewTodo, deleteTodo, findLabelByName, removeLabelFromTodo, updateTodo } from "@/features/todo/server/todos";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { labelKeys, todoKeys } from "./todo-queries";

type UpdateTodoLabelInput =
    | {
        action: "add";
        todoId: string;
        label: Label;
    }
    | {
        action: "remove";
        todoId: string;
        label: Label;
    }
    | {
        action: "create";
        todoId: string;
        name: string;
    };

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

export function useUpdateTodoLabels(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: UpdateTodoLabelInput) => {
            if (input.action === "remove") {
                await removeLabelFromTodo({
                    data: {
                        todoId: input.todoId,
                        labelId: input.label.id,
                    },
                });

                return {
                    action: "remove" as const,
                    label: input.label,
                };
            }

            if (input.action === "add") {
                await addLabelIntoTodo({
                    data: {
                        todoId: input.todoId,
                        labelId: input.label.id,
                    },
                });

                return {
                    action: "add" as const,
                    label: input.label,
                };
            }

            let label = await findLabelByName({
                data: {
                    name: input.name,
                },
            });

            if (!label) {
                label = await createNewLabel({
                    data: {
                        name: input.name,
                    },
                });
            }

            await addLabelIntoTodo({
                data: {
                    todoId: input.todoId,
                    labelId: label.id,
                },
            });

            return {
                action: "add" as const,
                label,
            };
        },

        onMutate: async (variables) => {
            await Promise.all([
                queryClient.cancelQueries({
                    queryKey: labelKeys.all,
                }),
                queryClient.cancelQueries({
                    queryKey: todoKeys.detail(variables.todoId),
                }),
            ]);

            const previousLabels =
                queryClient.getQueryData<Label[]>(labelKeys.all);

            const previousTodo =
                queryClient.getQueryData<TodoWithLabels>(
                    todoKeys.detail(variables.todoId),
                );

            if (variables.action === "remove") {
                queryClient.setQueryData<TodoWithLabels>(
                    todoKeys.detail(variables.todoId),
                    (todo) => {
                        if (!todo) return todo;

                        return {
                            ...todo,
                            todoLabels: todo.todoLabels.filter(({ label }) =>
                                label.id !== variables.label.id
                            ),
                        };
                    },
                );
            }

            if (variables.action === "add") {
                queryClient.setQueryData<TodoWithLabels>(
                    todoKeys.detail(variables.todoId),
                    (todo) => {
                        if (!todo) return todo;

                        return {
                            ...todo,
                            todoLabels: [
                                ...todo.todoLabels,
                                {
                                    label: variables.label,
                                },
                            ],
                        };
                    },
                );
            }

            if (variables.action === "create") {
                const optimisticLabel: Label = {
                    id: `optimistic-${crypto.randomUUID()}`,
                    name: variables.name,
                    userId,
                };

                queryClient.setQueryData<Label[]>(
                    labelKeys.all,
                    (labels = []) => [
                        ...labels,
                        optimisticLabel,
                    ],
                );

                queryClient.setQueryData<TodoWithLabels>(
                    todoKeys.detail(variables.todoId),
                    (todo) => {
                        if (!todo) return todo;

                        return {
                            ...todo,
                            todoLabels: [
                                ...todo.todoLabels,
                                {
                                    label: optimisticLabel,
                                },
                            ],
                        };
                    },
                );
            }

            return {
                previousLabels,
                previousTodo,
            };
        },

        onError: (_error, variables, context) => {
            if (context?.previousLabels) {
                queryClient.setQueryData(
                    labelKeys.all,
                    context.previousLabels,
                );
            }

            if (context?.previousTodo) {
                queryClient.setQueryData(
                    todoKeys.detail(variables.todoId),
                    context.previousTodo,
                );
            }
        },

        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({
                queryKey: labelKeys.all,
            });

            queryClient.invalidateQueries({
                queryKey: todoKeys.detail(variables.todoId),
            });
        },
    });
}