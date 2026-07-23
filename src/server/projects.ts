import { createServerFn } from "@tanstack/react-start"
import { db } from '@/db/drizzle';
import { projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { authMiddleware } from "@/lib/auth-middleware";
import * as z from "zod";

export const verifyProjectOwnership = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        projectId: z.string(),
    }))
    .handler(async ({ context, data }) => {
        const validProject = await db.select().from(projects).where(and(eq(projects.userId, context.user.id), eq(projects.id, data.projectId)));
        return validProject.length > 0;
    })

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

export const getUserProjects = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async ({ context }) => {
        const userProjects = await db.query.projects.findMany({
            where: eq(projects.userId, context.user.id),
            with: {
                todos: {
                    orderBy: (todos, { asc }) => [asc(todos.createdAt)],
                },
            },
            orderBy: (projects, { asc }) => [asc(projects.createdAt)],
        });
        return userProjects;
    });


export const getProject = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator((data: { projectId: string }) => data)
    .handler(async ({ data, context }) => {
        const project = await db.query.projects.findFirst({
            where: and(eq(projects.id, data.projectId), eq(projects.userId, context.user.id)),
            with: {
                todos: {
                    orderBy: (todos, { asc }) => [asc(todos.createdAt)],
                },
            },
        })

        return project ?? null;
    });

export const updateProjectName = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator((data: { projectId: string, name: string }) => data)
    .handler(async ({ data }) => {
        await db.update(projects).set({ name: data.name }).where(eq(projects.id, data.projectId));
    })

export const deleteProject = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        projectId: z.string(),
    }))
    .handler(async ({ data, context }) => {
        await db.delete(projects).where(
            and(
                eq(projects.id, data.projectId),
                eq(projects.userId, context.user.id),
            )
        )
    })