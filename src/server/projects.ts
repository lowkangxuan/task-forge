import { createServerFn } from "@tanstack/react-start"
import { db } from '@/db/drizzle';
import { projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { authMiddleware } from "@/lib/auth-middleware";
import * as z from "zod";


const defaultProjectInput = z.object({
    name: z.string(),
    description: z.string(),
})

async function insertProject(input: {
    userId: string;
    name: string;
    description?: string;
}) {
    return db.insert(projects).values(input).returning();
}

export const verifyProjectOwnership = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        projectId: z.string(),
    }))
    .handler(async ({ context, data }) => {
        const validProject = await db.select().from(projects).where(and(eq(projects.userId, context.user.id), eq(projects.id, data.projectId)));
        return validProject.length > 0;
    });

export const createNewProject = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(defaultProjectInput)
    .handler(async ({ context, data }) => {
        const project = await insertProject({
            userId: context.user.id,
            ...data,
        });
        console.log(project);
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


export const getProjectById = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        projectId: z.string(),
    }))
    .handler(async ({ context, data }) => {
        const { projectId } = data;
        const project = await db.query.projects.findFirst({
            where: and(eq(projects.id, projectId), eq(projects.userId, context.user.id)),
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
    .handler(async ({ context, data }) => {
        await db.delete(projects).where(
            and(
                eq(projects.id, data.projectId),
                eq(projects.userId, context.user.id),
            )
        )
    });

export const duplicateProject = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        projectId: z.string(),
    }))
    .handler(async ({ context, data }) => {
        const { projectId } = data;
        const projectToDupe = await getProjectById({
            data: {
                projectId: projectId,
            }
        });

        if (!projectToDupe) return undefined;

        const similarNames = await db.query.projects.findMany({
            where: (projects, { like }) => like(projects.name, `${projectToDupe.name}%`),
        })
        const nextSuffix = similarNames.length;
        const todos = projectToDupe.todos;

        await insertProject({
            userId: context.user.id,
            name: `${projectToDupe.name}_${nextSuffix}`,
            description: `${projectToDupe.description}`,
        });

        
    })