import { createServerFn } from "@tanstack/react-start"
import { db } from '@/db/drizzle';
import { projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { authMiddleware } from "@/lib/auth-middleware";

export const getUserProjects = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async ({ context }) => {
        const userProjects = await db.query.projects.findMany({
            where: eq(projects.userId, context.user.id),
            with: {
                todos: true,
            }
        });
        return userProjects;
    });

export const createNewProject = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator((data: { name: string, description: string }) => data)
    .handler(async ({ data, context }) => {
        await db.insert(projects).values(
            {
                userId: context.user.id,
                name: data.name,
                description: data.description,
            });
    });

export const getProject = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator((data: { projectId: string }) => data)
    .handler(async ({ data, context }) => {
        const project = await db.query.projects.findFirst({
            where: and(eq(projects.id, data.projectId), eq(projects.userId, context.user.id)),
            with: {
                todos: true,
            }
        })

        return project ?? null;
    });