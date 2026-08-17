import { db } from "@/db/drizzle";
import { projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function insertProject(input: {
    userId: string;
    name: string;
    description?: string;
}) {
    return db.insert(projects).values(input).returning();
}

export async function findProjectById(input: {
    userId: string,
    projectId: string,
}) {
    const { userId, projectId } = input;
    const result = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.userId, userId)),
        with: {
            todos: {
                with: {
                    todoLabels: {
                        with: {
                            label: true,
                        }
                    }
                },
                orderBy: (todos, { asc }) => [asc(todos.createdAt)],
            },
        },
    });

    return result ?? null;
}

export async function findManyProjects(userId: string) {
    const result = await db.query.projects.findMany({
        where: (projects, { eq }) => eq(projects.userId, userId),
        with: {
            todos: {
                with: {
                    todoLabels: {
                        with: {
                            label: true,
                        }
                    }
                },
                orderBy: (todos, { asc }) => [asc(todos.createdAt)],
            },
        },
        orderBy: (projects, { asc }) => [asc(projects.createdAt)],
    });

    return result ?? null;
}

export async function removeProject(input: {
    userId: string,
    projectId: string,
}) {
    const { userId, projectId } = input;

    await db.delete(projects).where(
        and(
            eq(projects.id, projectId),
            eq(projects.userId, userId),
        )
    )
}