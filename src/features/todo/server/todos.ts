import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth-middleware";
import * as z from "zod";
import { insertLabelToTodo, findAllUserLabels, findManyTodos, findOneTodoById, findTodayTodos, findUpcomingTodos, insertTodo, removeTodo, updateTodoData, insertLabel, findOneLabel, deleteLabelFromTodo } from "./todos.server";
import type { Priority } from "@/db/schema";

const updateTodoinputValidator = z.object({
    todoId: z.string(),
    updates: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        priority: z.custom<Priority>().optional(),
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
        priority?: Priority,
        isCompleted?: boolean,
        dueDate?: Date | null,
    }) => data)
    .handler(async ({ data }) => {
        const [newTodo] = await insertTodo(data);
        return newTodo;
    });


export const updateTodo = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator((updateTodoinputValidator))
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

export const getTodoById = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        todoId: z.string(),
    }))
    .handler(async ({ data }) => {
        const result = await findOneTodoById(data.todoId);
        return result;
    });

export const getTodos = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator((data: {
        projectId: string,
    }) => data)
    .handler(async ({ data }) => {
        return await findManyTodos(data.projectId);
    });

export const getTodayTodos = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async () => {
        return await findTodayTodos();
    });

export const getUpcomingTodos = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async () => {
        return await findUpcomingTodos();
    });

export const getUserLabels = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        userId: z.string(),
    }))
    .handler(async ({ data }) => {
        return await findAllUserLabels(data.userId);
    })

export const findLabelByName = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        name: z.string(),
    }))
    .handler(async ({ context, data }) => {
        const { id: userId } = context.user;
        const { name } = data;
        return await findOneLabel(userId, name);
    })

export const createNewLabel = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        name: z.string(),
    }))
    .handler(async ({ context, data }) => {
        const { id: userId } = context.user;
        const { name } = data;
        return await insertLabel(userId, name);
    });

export const addLabelIntoTodo = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        labelId: z.string(),
        todoId: z.string(),
    }))
    .handler(async ({ data }) => {
        const { labelId, todoId } = data;
        return await insertLabelToTodo(labelId, todoId);
    });

export const removeLabelFromTodo = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        labelId: z.string(),
        todoId: z.string(),
    }))
    .handler(async ({ data }) => {
        const { labelId, todoId } = data;
        return await deleteLabelFromTodo(labelId, todoId);
    });