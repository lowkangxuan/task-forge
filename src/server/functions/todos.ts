import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth-middleware";
import * as z from "zod";
import { findManyTodos, insertTodo, removeTodo, updateTodoData } from "../repositories/todos.server";

const updateTodoinputValidator = z.object({
    todoId: z.string(),
    updates: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isCompleted: z.boolean().optional(),
        dueDate: z.coerce.date().nullable().optional(),
    }),
});

export const createNewTodo = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator((data: {
        projectId: string,
        name: string,
        description?: string | null,
        isCompleted?: boolean,
        dueDate?: Date | null,
    }) => data)
    .handler(async ({ data }) => {
        return await insertTodo(data);
    });


export const updateTodo = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(updateTodoinputValidator)
    .handler(async ({ data }) => {
        const { todoId, updates } = data;
        await updateTodoData({
            todoId: todoId,
            updates,
        });
    });


export const deleteTodo = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        todoId: z.string(),
    }))
    .handler(async ({ data }) => {
        const { todoId } = data;
        const [deletedTodo] = await removeTodo(todoId)
        return deletedTodo;
    });

export const getTodos = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator((data: {
        projectId: string,
    }) => data)
    .handler(async ({ data }) => {
        const tasks = await findManyTodos(data.projectId);
        return tasks;
    });