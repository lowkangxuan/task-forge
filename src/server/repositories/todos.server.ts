import { db } from "@/db/drizzle";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as z from "zod";

const updateTodoValidator = z.object({
    todoId: z.string(),
    updates: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isCompleted: z.boolean().optional(),
        dueDate: z.coerce.date().nullable().optional(),
    }),
});

export async function insertTodo(input: {
    projectId: string,
    name: string,
    description?: string,
    isCompleted?: boolean,
    dueDate?: Date,
}) {
    return await db.insert(todos).values(input).returning();
}

export async function updateTodoData(input: {
    todoId: string,
    updates: {
        name?: string,
        description?: string,
        isCompleted?: boolean,
        dueDate?: Date | null,
    }
}) {
    await db.update(todos).set(input.updates).where(eq(todos.id, input.todoId));
}

export async function removeTodo(todoId: string) {
    await db.delete(todos).where(eq(todos.id, todoId));
}

export async function findManyTodos(projectId: string) {
    return await db.select().from(todos).where(eq(todos.projectId, projectId));
}