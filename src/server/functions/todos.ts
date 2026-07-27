import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth-middleware";
import * as z from "zod";
import { findManyTodos, insertTodo, removeTodo, updateTodoData } from "../repositories/todos.server";

const updateTodoValidator = z.object({
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
        description?: string,
        isCompleted?: boolean,
        dueDate?: Date,
    }) => data)
    .handler(async ({ data }) => {
        await insertTodo(data);
    });


export const updateTodoDebounce = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(updateTodoValidator)
    .handler(async ({ data }) => {
        const { todoId, updates } = data;
        await updateTodoData({
            todoId: todoId,
            updates,
        });
    });

export const updateTodoImmediate = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(updateTodoValidator)
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
        await removeTodo(todoId);
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