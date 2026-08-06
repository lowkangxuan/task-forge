import { db } from "@/db/drizzle";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function insertTodo(input: {
    projectId: string,
    name: string,
    description?: string | null,
    isCompleted?: boolean,
    dueDate?: Date | null,
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
    return await db.delete(todos).where(eq(todos.id, todoId)).returning();
}

export async function findManyTodos(projectId: string) {
    return await db.select().from(todos).where(eq(todos.projectId, projectId));
}