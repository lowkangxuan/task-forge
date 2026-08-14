import { db } from "@/db/drizzle";
import { todos, type Priority } from "@/db/schema";
import { endOfDay, startOfDay, startOfTomorrow } from "date-fns";
import { asc, between, eq, gte } from "drizzle-orm";

export async function insertTodo(input: {
    projectId: string,
    name: string,
    description?: string | null,
    priority?: Priority,
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
        priority?: Priority,
        isCompleted?: boolean,
        dueDate?: Date | null,
    }
}) {
    await db.update(todos).set(input.updates).where(eq(todos.id, input.todoId));
}

export async function removeTodo(todoId: string) {
    return await db.delete(todos).where(eq(todos.id, todoId)).returning();
}

export async function findOneTodoById(todoId: string) {
    const result = await db.query.todos.findFirst({
        where: eq(todos.id, todoId),
        with: {
            parentProject: true,
        }
    });
    return result;
}

export async function findManyTodos(projectId: string) {
    return await db.select().from(todos).where(eq(todos.projectId, projectId));
}

export async function findTodayTodos() {
    const today = new Date();
    const startDate = startOfDay(today);
    const endDate = endOfDay(today);
    return await db.select().from(todos).where(between(todos.dueDate, startDate, endDate)).orderBy(asc(todos.createdAt));
}

export async function findUpcomingTodos() {
    const tomorrow = startOfTomorrow();
    return await db.select().from(todos).where(gte(todos.dueDate, tomorrow)).orderBy(asc(todos.dueDate), asc(todos.createdAt));
}