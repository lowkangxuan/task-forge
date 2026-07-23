import { db } from "@/db/drizzle";
import { todos } from "@/db/schema";
import { authMiddleware } from "@/lib/auth-middleware";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import * as z from "zod";

const updateTodoImmediateSchema = z.object({
    todoId: z.string(),
    updates: z.object({
        isCompleted: z.boolean().optional(),
        dueDate: z.coerce.date().nullable().optional(),
    }),
});

export const createNewTodo = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator((data: {
        projectId: string,
        title: string,
        description?: string,
        isCompleted?: boolean,
        dueDate?: Date,
    }) => data)
    .handler(async ({ data }) => {
        await db.insert(todos).values({
            projectId: data.projectId,
            name: data.title,
            description: data.title,
            isCompleted: data.isCompleted,
            dueDate: data.dueDate,
        })
    });

export const getTodos = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator((data: {
        projectId: string,
    }) => data)
    .handler(async ({ data }) => {
        const tasks = await db.select().from(todos).where(eq(todos.projectId, data.projectId));
        return tasks;
    })

export const updateTodoDebounce = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        todoId: z.string(),
        updates: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
        }),
    }))
    .handler(async ({ data }) => {
        const { todoId, updates } = data;
        await db.update(todos).set(updates).where(eq(todos.id, todoId));
    })

export const updateTodoImmediate = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(updateTodoImmediateSchema)
    .handler(async ({ data }) => {
        const { todoId, updates } = data;
        await db.update(todos).set(updates).where(eq(todos.id, todoId));
    })

export const deleteTodo = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        todoId: z.string(),
    }))
    .handler(async ({ data }) => {
        const { todoId } = data;
        await db.delete(todos).where(eq(todos.id, todoId));
    })