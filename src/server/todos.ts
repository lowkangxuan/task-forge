import { db } from "@/db/drizzle";
import { todos } from "@/db/schema";
import { authMiddleware } from "@/lib/auth-middleware";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

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

        console.log("New todo created!");
    });

export const getTodos = createServerFn({ method: "GET"})
    .middleware([authMiddleware])
    .inputValidator((data: {
        projectId: string,
    }) => data)
    .handler(async ({ data }) => {
        const tasks = await db.select().from(todos).where(eq(todos.projectId, data.projectId));
        return tasks;
    })

export const updateTodoName = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator((data: { todoId: string, newName: string}) => data)
    .handler(async ({ data }) => {
        await db.update(todos).set({ name: data.newName}).where(eq(todos.id, data.todoId));
    })